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

var _BaseFindForm = require('./BaseFindForm');

var _BaseFindForm2 = _interopRequireDefault(_BaseFindForm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

GoLineForm._label = " line number: ";
function GoLineForm(opts) {
  var self = this;

  if (!(self instanceof GoLineForm)) return new GoLineForm(opts);

  _BaseFindForm2.default.call(self, _lodash2.default.merge({
    findField: { left: GoLineForm._label.length }
  }, _Slap2.default.global.options.form.goLine, opts));

  self.goLineLabel = new _baseWidget2.default(_lodash2.default.merge({
    parent: self,
    tags: true,
    content: GoLineForm._label,
    top: 0,
    height: 1,
    left: 0,
    width: GoLineForm._label.length,
    style: self.options.style
  }, self.options.goLineLabel));
}
GoLineForm.prototype.__proto__ = _BaseFindForm2.default.prototype;

GoLineForm.prototype._initHandlers = function () {
  var self = this;
  self.on('cancel', function () {
    self.resetEditor();
  });
  self.on('show', function () {
    self.findField.textBuf.setText('');
  });
  self.on('find', function (lineNumber, direction) {
    lineNumber = Number(lineNumber) - 1;
    if (lineNumber !== lineNumber) return; // isNaN(lineNumber)
    var selection = self.pane.editor.selection;
    selection.setHeadPosition([lineNumber, 0]);
    selection.clearTail();
    if (direction) self.hide();
    return self;
  });
  return _BaseFindForm2.default.prototype._initHandlers.apply(self, arguments);
};

exports.default = GoLineForm;