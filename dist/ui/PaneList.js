'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _slapUtil = require('slap-util');

var _slapUtil2 = _interopRequireDefault(_slapUtil);

var _baseWidget = require('base-widget');

var _baseWidget2 = _interopRequireDefault(_baseWidget);

var _Pane = require('./Pane');

var _Pane2 = _interopRequireDefault(_Pane);

var _Slap = require('./Slap');

var _Slap2 = _interopRequireDefault(_Slap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

PaneList.prototype.__proto__ = _Pane2.default.prototype;
function PaneList(opts) {
  var self = this;

  if (!(self instanceof PaneList)) return new PaneList(opts);

  _Pane2.default.call(self, _lodash2.default.merge({}, _Slap2.default.global.options.paneList, opts));

  self.topContent = new _baseWidget2.default(_lodash2.default.merge({
    parent: self,
    tags: true,
    shrink: true,
    top: 1,
    left: 'center',
    style: self.options.style
  }, self.options.topContent));

  var listOpts = _lodash2.default.merge({
    parent: self,
    mouse: true,
    keys: true,
    focusable: true,
    tags: true,
    top: 3,
    style: self.options.style
  }, self.options.list);
  self.list = new _baseWidget2.default.blessed.List(listOpts);
  _baseWidget2.default.call(self.list, listOpts);
}

PaneList.prototype.close = function () {
  // Don't actually close anything, just act closed and maybe setFront another pane
  var self = this;
  var slap = self.screen.slap;
  if (self === slap.getCurrentPane()) {
    var prevPane = slap.getPrevPane();
    if (prevPane) prevPane.setCurrent();
  }
  return true;
};

PaneList.prototype.getTitle = function () {
  return _slapUtil2.default.markup("<PaneList>", this.style.paneList).toString();
};

PaneList.prototype._initHandlers = function () {
  var self = this;
  var slap = self.screen.slap;

  self.on('element mousedown', function (el) {
    self.focus();
  });

  slap.on('element keypress', function (el, ch, key) {
    if (!(el === self || el.hasAncestor(self))) return;
    switch (self.resolveBinding(key)) {
      case 'cancel':
        var prevPane = slap.getPrevPane();
        if (prevPane) prevPane.setCurrent();
        return false;
    }
  });

  self.on('focus', function () {
    self.screen.program.hideCursor();
  });

  self.update()[('adopt', 'remove')].forEach(function (evt) {
    slap.on('element ' + evt, function (parent, child) {
      if (child instanceof _Pane2.default) setImmediate(function () {
        self.update();
      });
    });
  });

  self.list.on('select', function (_, i) {
    slap._stopKeyPropagation().then(function () {
      slap.panes[i].setCurrent();
    });
  });

  return _Pane2.default.prototype._initHandlers.apply(self, arguments);
};
PaneList.prototype.update = function () {
  var self = this;
  var slap = self.screen.slap;

  var list = self.list;
  var items = slap.panes.reduce(function (items, pane) {
    var title = pane.getTitle();
    if (title !== null) items.push(title);
    return items;
  }, []);
  list.setItems(items);

  var topContent = self.topContent;
  topContent.setContent(items.length + " pane" + (items.length === 1 ? '' : 's') + " open");

  return self;
};

exports.default = PaneList;