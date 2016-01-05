'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _baseWidget = require('base-widget');

var _baseWidget2 = _interopRequireDefault(_baseWidget);

var _BaseForm2 = require('./BaseForm');

var _BaseForm3 = _interopRequireDefault(_BaseForm2);

var _SlapField = require('./SlapField');

var _opts = require('../opts');

var _opts2 = _interopRequireDefault(_opts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseFindForm = (function (_BaseForm) {
  _inherits(BaseFindForm, _BaseForm);

  function BaseFindForm() {
    _classCallCheck(this, BaseFindForm);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(BaseFindForm).apply(this, arguments));
  }

  _createClass(BaseFindForm, [{
    key: 'getInitialState',
    value: function getInitialState() {
      return _lodash2.default.merge({ prevEditorState: {} }, _get(Object.getPrototypeOf(BaseFindForm.prototype), 'getInitialState', this).apply(this, arguments));
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var self = this;

      var textBuf = self.refs.findField.textBuf;
      textBuf.onDidChange(function () {
        self.find(textBuf.getText());
      });

      return _get(Object.getPrototypeOf(BaseFindForm.prototype), 'componentDidMount', this).apply(self, arguments);
    }
  }, {
    key: 'find',
    value: function find(text, direction) {
      this.context.slap.header.setState({ message: null });
      if (text) this.emit('find', text, direction);else this.resetEditor();
      return this;
    }
  }, {
    key: 'resetEditor',
    value: function resetEditor() {
      var prevEditorState = this.state.prevEditorState;
      var editor = this.context.pane.refs.editor;
      if (prevEditorState.selection) editor.selection.setRange(prevEditorState.selection);
      if (prevEditorState.scroll) {
        editor.scroll = prevEditorState.scroll;
        editor.forceUpdate();
      }
    }
  }, {
    key: 'onFindFieldKeypress',
    value: function onFindFieldKeypress(ch, key) {
      var text = this.refs.findField.textBuf.getText();
      switch (this.resolveBinding(key)) {
        case 'next':
          this.find(text, 1);return false;
        case 'prev':
          this.find(text, -1);return false;
      }
    }
  }, {
    key: 'onHide',
    value: function onHide() {
      if (!this.context.pane.state.visibleForm) {
        this.setState({ prevEditorState: {
            selection: null,
            scroll: null
          } });
      }
    }
  }, {
    key: 'onShow',
    value: function onShow() {
      var prevEditorState = this.state.prevEditorState;
      var textBuf = this.refs.findField.textBuf;
      var editor = this.context.pane.editor;
      if (!prevEditorState.selection) prevEditorState.selection = editor.selection.getRange();
      if (!prevEditorState.scroll) prevEditorState.scroll = editor.scroll;
      this.setState({ prevEditorState: prevEditorState });
      this.findField.focus();
      this.find(textBuf.getText());
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'element',
        { ref: 'root',
          onShow: this.onShow.bind(this),
          onHide: this.onHide.bind(this) },
        _react2.default.createElement(_SlapField.SlapField, _extends({ ref: 'findField' }, this.props.findField, {
          onKeypress: this.onFindFieldKeypress.bind(this), keyable: true,
          top: 0,
          left: 0,
          right: 0 }))
      );
    }
  }], [{
    key: 'defaultProps',
    get: function get() {
      return _lodash2.default.merge({}, _BaseForm3.default.defaultProps, _opts2.default.form.baseFind);
    }
  }]);

  return BaseFindForm;
})(_BaseForm3.default);

exports.default = BaseFindForm;