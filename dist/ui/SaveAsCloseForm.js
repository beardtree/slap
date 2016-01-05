'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _baseWidget = require('base-widget');

var _baseWidget2 = _interopRequireDefault(_baseWidget);

var _Slap = require('./Slap');

var _Slap2 = _interopRequireDefault(_Slap);

var _SaveAsForm = require('./SaveAsForm');

var _SaveAsForm2 = _interopRequireDefault(_SaveAsForm);

var _Button = require('./Button');

var _Button2 = _interopRequireDefault(_Button);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function SaveAsCloseForm(opts) {
  var self = this;

  if (!(self instanceof SaveAsCloseForm)) return new SaveAsCloseForm(opts);

  _SaveAsForm2.default.call(self, _lodash2.default.merge({}, _Slap2.default.global.options.saveAsCloseForm, opts));

  self.discardChangesButton = new _Button2.default(_lodash2.default.merge({
    parent: self,
    content: "Discard changes",
    top: 0,
    right: 0
  }, _Slap2.default.global.options.button.warning, self.options.discardChangesButton));

  self.pathField.right = _baseWidget2.default.prototype.shrinkWidth.call(self.discardChangesButton);
}
SaveAsCloseForm.prototype.__proto__ = _SaveAsForm2.default.prototype;

SaveAsCloseForm.prototype._initHandlers = function () {
  var self = this;
  self.on('show', function () {
    self.screen.slap.header.message("unsaved changes, please save or discard", 'warning');
  });
  self.on('save', function () {
    self.pane.close();
  });
  self.on('discardChanges', function () {
    self.pane.editor.textBuf.reload();
    self.pane.close();
  });
  self.discardChangesButton.on('press', function () {
    self.emit('discardChanges');
  });
  return _SaveAsForm2.default.prototype._initHandlers.apply(self, arguments);
};

exports.default = SaveAsCloseForm;