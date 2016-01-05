'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _blessed = require('blessed');

var _blessed2 = _interopRequireDefault(_blessed);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _slapUtil = require('slap-util');

var _slapUtil2 = _interopRequireDefault(_slapUtil);

var _baseWidget = require('base-widget');

var _baseWidget2 = _interopRequireDefault(_baseWidget);

var _Slap = require('./Slap');

var _Slap2 = _interopRequireDefault(_Slap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Button(opts) {
  var self = this;

  if (!(self instanceof Button)) return new Button(opts);

  opts = _lodash2.default.merge({
    mouse: true,
    focusable: true,
    shrink: true,
    padding: { left: 1, right: 1 }
  }, _Slap2.default.global.options.button, opts);
  opts.style.focus = opts.style.hover;
  _baseWidget2.default.blessed.Button.call(self, opts);
  _baseWidget2.default.call(self, opts);
}
Button.prototype.__proto__ = _baseWidget2.default.blessed.Button.prototype;
Button.prototype._initHandlers = function () {
  var self = this;
  self.on('keypress', function (ch, key) {
    if (key.name === 'enter') self.screen.slap._stopKeyPropagation().done(); // FIXME: hack
  });
  return _baseWidget2.default.prototype._initHandlers.apply(self, arguments);
};

exports.default = Button;