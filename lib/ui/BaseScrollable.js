var blessed = require('blessed');
var _ = require('lazy.js');

var Slap = require('./Slap');
var BaseElement = require('./BaseElement');

var Coordinate = require('../Coordinate');
var util = require('../util');
var markup = require('../markup');

function BaseScrollable (opts) {
  var self = this;

  if (!(self instanceof blessed.Node)) return new BaseScrollable(opts);

  BaseElement.call(self, _(Slap.global.options.scrollable)
    .merge({
      tags: true,
      wrap: false,
    })
    .merge(opts || {})
    .toObject());

  self.scroll(Coordinate.origin());
}
BaseScrollable.prototype.__proto__ = BaseElement.prototype;

BaseScrollable.prototype.scroll = util.getterSetter('scroll', util.clone, Coordinate.setter(function (c) {
  return Coordinate({
    x: Infinity,
    // y: this.renderableLines().length
    y: Infinity
  }).subtract(this.size());
}));

BaseScrollable.prototype._initHandlers = function () {
  var self = this;

  self.on('mouse', function (mouseData) {
    if (mouseData.action === 'wheeldown' || mouseData.action === 'wheelup') {
      self.scroll(Coordinate(self.scroll()).add({
        x: 0,
        y: {
          wheelup: -1,
          wheeldown: 1
        }[mouseData.action] * self.options.pageLines
      }));
    }
  });

  return BaseElement.prototype._initHandlers.apply(self, arguments);
};

BaseScrollable.prototype.render = function () {
  var self = this;

  var scroll = self.scroll();
  var size = self.size();

  var defaultStyle = self.options.style.default;

  self.setContent(self.renderableLines()
    .slice(scroll.y, scroll.y + size.y)
    .map(function (line, y) {
      var x = scroll.x;
      y += scroll.y;

      var markupScrollX = markup.index(line, x);
      return [
        markup.getOpenTags(line.slice(0, markupScrollX)).join(''),
        markup(line.slice(markupScrollX, markup.index(line, x + size.x)) + _.repeat(' ', size.x).join(''), defaultStyle),
        '{/}'
      ].join('');
    })
    .join('\n'));

  return BaseElement.prototype.render.apply(self, arguments);
};

module.exports = BaseScrollable;
