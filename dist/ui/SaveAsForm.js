'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _baseWidget = require('base-widget');

var _baseWidget2 = _interopRequireDefault(_baseWidget);

var _editorWidget = require('editor-widget');

var _Slap = require('./Slap');

var _Slap2 = _interopRequireDefault(_Slap);

var _BaseForm = require('./BaseForm');

var _BaseForm2 = _interopRequireDefault(_BaseForm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

SaveAsForm._label = " save as: ";
function SaveAsForm(opts) {
  var self = this;

  if (!(self instanceof SaveAsForm)) return new SaveAsForm(opts);

  _BaseForm2.default.call(self, _lodash2.default.merge({
    field: { left: SaveAsForm._label.length }
  }, _Slap2.default.global.options.form.saveAs, opts));

  self.saveAsLabel = new _baseWidget2.default(_lodash2.default.merge({
    parent: self,
    tags: true,
    content: SaveAsForm._label,
    top: 0,
    height: 1,
    left: 0,
    width: SaveAsForm._label.length,
    style: self.options.style
  }, self.options.saveAsLabel));

  self.pathField = new _editorWidget.Field(_lodash2.default.merge({
    parent: self,
    top: 0,
    left: SaveAsForm._label.length,
    right: 0
  }, _Slap2.default.global.options.editor, _Slap2.default.global.options.field, self.options.pathField));
}
SaveAsForm.prototype.__proto__ = _BaseForm2.default.prototype;

SaveAsForm.prototype._initHandlers = function () {
  var self = this;
  self.on('show', function () {
    self.pathField.textBuf.setText(self.pane.editor.textBuf.getPath() || '');
    self.pathField.selection.setHeadPosition([0, Infinity]);
    self.pathField.focus();
  });
  self.on('submit', function () {
    var path = self.pathField.textBuf.getText();
    if (!path) {
      self.screen.slap.header.message("couldn't save, no filename passed", 'error');
      return;
    }
    self.pane.save(path).done(function (newPath) {
      if (newPath) {
        self.hide();
        self.emit('save', newPath);
      }
    });
  });
  return _BaseForm2.default.prototype._initHandlers.apply(self, arguments);
};

exports.default = SaveAsForm;