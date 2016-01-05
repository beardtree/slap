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

var _Slap = require('./Slap');

var _Slap2 = _interopRequireDefault(_Slap);

var _BaseFindForm = require('./BaseFindForm');

var _BaseFindForm2 = _interopRequireDefault(_BaseFindForm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

FindForm._label = " find (/.*/ for regex): ";
FindForm._regExpRegExp = /^\/(.+)\/(\w*)$/i;
FindForm._invalidRegExpMessageRegExp = /^(Invalid regular expression:|Invalid flags supplied to RegExp constructor)/;
function FindForm(opts) {
  var self = this;

  if (!(self instanceof FindForm)) return new FindForm(opts);

  _BaseFindForm2.default.call(self, _lodash2.default.merge({
    findField: { left: FindForm._label.length }
  }, _Slap2.default.global.options.form.find, opts));

  self.findLabel = new _baseWidget2.default(_lodash2.default.merge({
    parent: self,
    tags: true,
    content: FindForm._label,
    top: 0,
    height: 1,
    left: 0,
    width: FindForm._label.length,
    style: self.options.style
  }, self.options.findLabel));
}
FindForm.prototype.__proto__ = _BaseFindForm2.default.prototype;

FindForm.prototype.selectRange = function (range) {
  var self = this;
  var editor = self.pane.editor;
  var selection = editor.selection;
  selection.setRange(range);
  var visibleRange = editor.visiblePos(range);
  editor.clipScroll([visibleRange.start, visibleRange.end]);
  return self;
};
FindForm.prototype._initHandlers = function () {
  var self = this;
  var header = self.screen.slap.header;
  var editor = self.pane.editor;
  var selection = editor.selection;

  self.on('hide', function () {
    editor.destroyMarkers({ type: 'findMatch' });
    editor._updateContent();
  });
  self.on('find', _lodash2.default.throttle(function (pattern, direction) {
    direction = direction || 0;
    editor.destroyMarkers({ type: 'findMatch' });
    try {
      var regExpMatch = pattern.match(FindForm._regExpRegExp);
      pattern = new RegExp(regExpMatch[1], regExpMatch[2].replace('g', '') + 'g');
    } catch (e) {
      if (e.message.match(FindForm._invalidRegExpMessageRegExp)) {
        header.message(e.message, 'error');
        self.resetEditor();
        return;
      }
      pattern = new RegExp(_lodash2.default.escapeRegExp(pattern), 'img');
    }

    var selectionRange = selection.getRange();
    var matches = [];
    editor.textBuf[direction === -1 ? 'backwardsScan' : 'scan'](pattern, function (match) {
      matches.push(match);
      editor.textBuf.markRange(match.range, { type: 'findMatch' });
    });

    if (!matches.length) {
      header.message("no matches", 'warning');
      self.resetEditor();
      return;
    }
    if (!matches.some(function (match) {
      var matchRange = match.range;
      var cmp = matchRange.start.compare(selectionRange.start);
      if (cmp === direction) {
        self.selectRange(matchRange);
        return true;
      } else if (!cmp && matches.length === 1) {
        header.message("this is the only occurrence", 'info');
        return true;
      }
    })) {
      header.message("search wrapped", 'info');
      self.selectRange(matches[0].range);
    }
    editor._updateContent();
  }, self.options.perf.findThrottle));
  return _BaseFindForm2.default.prototype._initHandlers.apply(self, arguments);
};

exports.default = FindForm;