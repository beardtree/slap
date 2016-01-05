'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _BaseComponent2 = require('./BaseComponent');

var _BaseComponent3 = _interopRequireDefault(_BaseComponent2);

var _opts = require('../opts');

var _opts2 = _interopRequireDefault(_opts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseForm = (function (_BaseComponent) {
  _inherits(BaseForm, _BaseComponent);

  function BaseForm() {
    _classCallCheck(this, BaseForm);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(BaseForm).apply(this, arguments));
  }

  _createClass(BaseForm, [{
    key: 'cancel',
    value: function cancel() {
      this.emit('cancel');
    }
  }, {
    key: 'submit',
    value: function submit() {
      this.emit('submit');
    }
  }, {
    key: 'onKeypress',
    value: function onKeypress(ch, key) {
      switch (self.resolveBinding(key)) {
        case 'cancel':
          self.cancel();return false;
      }
    }
  }, {
    key: 'onHide',
    value: function onHide() {
      this.context.slap._stopKeyPropagation().done();
      if (this.screen.focused.hasAncestor(this.context.pane) && !this.screen.focused.visible) this.context.pane.focus();
    }
  }, {
    key: 'render',
    value: function render() {
      var self = this;

      return _react2.default.createElement('element', { ref: 'root',
        onShow: function onShow() {
          self.focus();
        },
        onHide: self.onHide.bind(self),
        onBlur: function onBlur() {
          if (self.visible && !self.hasFocus(true)) self.cancel();
        },
        onSubmit: function onSubmit() {
          self.submit();
        },
        onCancel: function onCancel() {
          self.cancel();self.hide();
        },
        onKeypress: self.onKeypress.bind(self), keyable: true,
        hidden: true,
        height: 1,
        left: 0,
        right: 0,
        bottom: 0 });
    }
  }], [{
    key: 'defaultProps',
    get: function get() {
      return _lodash2.default.merge({}, _BaseComponent3.default.defaultProps, _opts2.default.form);
    }
  }]);

  return BaseForm;
})(_BaseComponent3.default);

exports.default = BaseForm;