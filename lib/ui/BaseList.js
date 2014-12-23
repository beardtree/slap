var blessed = require('blessed');
var _ = require('lazy.js');

var Slap = require('./Slap');
var BaseScrollable = require('./BaseScrollable');

var Coordinate = require('../Coordinate');
var util = require('../util');
var markup = require('../markup');

function BaseList (opts) {
  var self = this;

  if (!(self instanceof blessed.Node)) return new BaseList(opts);

  BaseScrollable.call(self, _(Slap.global.options.list)
    .merge({focusable: true})
    .merge(opts || {})
    .toObject());

  self.once('ready', function () {
    self.items(opts.items || []); // FIXME: should be in constructor
  });
}
BaseList.prototype.__proto__ = BaseScrollable.prototype;

BaseList.prototype.items = util.getterSetter('items', null, null);
BaseList.prototype.selectedHierarchy = function () {
  var self = this;
  var selectedIndices = self.data.selectedIndices;
  return selectedIndices.reduce(function (hierarchy, selectedIndex) {
    var item = hierarchy[hierarchy.length - 1].item;
    item.expanded = true; // should be no need for this
    var selectedChild = item.children[selectedIndex];
    // if (selectedIndex !== selectedIndices.length - 1 && !selectedChild.expanded) throw new Error("selectedIndex does not exist");
    hierarchy.push({
      item: selectedChild,
      index: selectedIndex
    });
    return hierarchy;
  }, [{item: {children: self.items()}}]).slice(1);
};
BaseList.prototype.selected = function () {
  return this.selectedHierarchy().pop().item;
};
BaseList.prototype.moveUp = function () { return this.moveVertical(-1); };
BaseList.prototype.moveDown = function () { return this.moveVertical(1); };
BaseList.prototype.moveVertical = function (direction) {
  var self = this;
  var selected;
  self.data.selectedIndices = self.selectedHierarchy().reverse().reduce(function (indices, ancestor) {
    var i = ancestor.index + direction;
    var item = ancestor.item;
    var length = item.children.length;
    if      (i < 0)       { direction += i; }
    else if (i >= length) { direction -= i - length; }
    else                  { direction = 0; indices.unshift(i); if (!selected) selected = item; }
    return indices;
  }, []);
  self.emit('move', selected);
  return self;
};
BaseList.prototype.moveOut = function () {
  var self = this;
  if (self.data.selectedIndices.pop()) self.emit('move', self.selectedHierarchy().pop().item);
  return self;
};
BaseList.prototype.moveRight = function () {
  var self = this;
  var firstChild = (self.selected().children || [])[0];
  if (firstChild) {
    self.data.selectedIndices.push(0);
    self.emit('move', firstChild);
  }
  return self;
};
BaseList.prototype.choose = function () {
  var self = this;
  var choice = self.selected();
  if (choice.children) {
    choice.expanded = !choice.expanded;
    self.emit(choice.expanded ? 'expand' : 'contract', choice);
    if (choice.expanded) self.moveDown();
  } else if (choice.choosable) {
    self.emit('choice', choice);
  }
  return self;
};

BaseList.itemHeight = function (item) {
  return 1 + (item.expanded && item.children || []).reduce(function (total, item) { return total + BaseList.itemHeight(item); }, 0);
};

BaseList.prototype.renderableLines = function () {
  var self = this;
  return self._cachedRenderableLines || self.computeRenderableLines();
};
BaseList.prototype.computeRenderableLines = function () {
  var self = this;
  return self._cachedRenderableLines = self._renderableLineData(self.items(), (self.data.selectedIndices || []).slice()).map(function (lineData) {
    return markup(lineData.line, self.hasFocus() && lineData.selected ? self.style.item.selected : self.style.item.default);
  });
};
BaseList.prototype._renderableLineData = function (items, indices) {
  var self = this;
  var selectable = !!indices;
  return (items || []).reduce(function (lines, item, index) {
    var lineData = {line: item.name};
    if (item.children) lineData.line = (item.expanded ? '-' : '+') + ' ' + lineData.line;
    if (selectable) {
      if (index === indices[0]) indices.shift();
      if (!indices.length) {
        lineData.selected = true;
        selectable = false;
      }
    }
    lines.push(lineData);
    if (item.expanded) lines = lines.concat(self._renderableLineData(item.children, selectable && indices).map(function (lineData) {
      return lineData.line = '  ' + lineData.line;
    }));
    return lines;
  }, []);
};
BaseList.prototype._initHandlers = function () {
  var self = this;
  self.on('element keypress', function (el, ch, key) {
    switch (util.getBinding(self.options.bindings, key)) {
      case 'moveUp': self.moveUp(); return false;
      case 'moveDown': self.moveDown(); return false;
      case 'moveOut': self.moveOut(); return false;
      case 'moveIn': self.moveIn(); return false;
      case 'choose': self.choose(); return false;
    };
  });
  self.on('items', function (items) {
    self.data.selectedIndices = items.length ? [0] : [];
    self._cachedRenderableLines = null;
    self.render();
  });

  self.on('move', function (item) {
    var lastItemData;
    var scroll = Coordinate({
      x: self.data.selectedIndices.length * 2,
      y: self.selectedHierarchy().reduce(function (y, itemData) {
        if (lastItemData) {
          y += lastItemData.item.children.slice(0, itemData.index).reduce(function (total, child) {
            return total + BaseList.itemHeight(child);
          });
        }
        lastItemData = itemData;
        return y;
      }, 0)
    });
    var selectedPadding = self.options.selectedPadding || {};
    var minScroll = scroll.subtract({x: selectedPadding.left || 0, y: selectedPadding.top || 0});
    var maxScroll = scroll
      .subtract(self.size())
      .add({x: selectedPadding.right || 0, y: selectedPadding.bottom || 0})
      .add({x: 1, y: 1});

    self.scroll(Coordinate.max(Coordinate.min(self.scroll(), minScroll), maxScroll));
  });

  // self.on('scroll', function (scroll) {
  //   var depth = self.data.selectedIndices.length * 2;
  //   if (scroll.x !== depth) self.scroll({x: depth, y: scroll.y});
  // });

  ['expand', 'contract'].forEach(function () {
    self.computeRenderableLines();
    self.render();
  });

  return BaseScrollable.prototype._initHandlers.apply(self, arguments);
};

module.exports = BaseList;
