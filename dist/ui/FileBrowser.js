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

function FileBrowser(opts) {
  var self = this;

  if (!(self instanceof FileBrowser)) return new FileBrowser(opts);

  opts = _lodash2.default.merge({
    keys: true,
    mouse: true,
    focusable: true
  }, _Slap2.default.global.options.fileBrowser, opts);
  _baseWidget2.default.blessed.FileManager.call(self, opts);
  _baseWidget2.default.call(self, opts);

  self.refresh();
  self.data.selectedStyle = self.style.selected;
  self.data.itemStyle = self.style.item;
}
FileBrowser.prototype.__proto__ = _baseWidget2.default.blessed.FileManager.prototype;

FileBrowser.prototype._initHandlers = function () {
  var self = this;
  var slap = self.screen.slap;
  self.on('element mousedown', function (el) {
    self.focus();
  });
  self.on('file', function (path) {
    slap.open(path, true).done();
  });
  self.on('cancel', function () {
    var currentPane = slap.getCurrentPane();
    if (currentPane) currentPane.focus();
  });

  self.on('focus', function () {
    self.style.selected = self.data.selectedStyle;
    self.screen.program.hideCursor();
  });
  self.on('blur', function () {
    self.style.selected = self.data.itemStyle;
  });

  return _baseWidget2.default.prototype._initHandlers.apply(self, arguments);
};

exports.default = FileBrowser;