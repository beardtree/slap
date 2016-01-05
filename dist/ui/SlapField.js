'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _editorWidget = require('editor-widget');

var _BaseComponent = require('./BaseComponent');

var _BaseComponent2 = _interopRequireDefault(_BaseComponent);

var _opts = require('../opts');

var _opts2 = _interopRequireDefault(_opts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SlapField = (function (_Field) {
  _inherits(SlapField, _Field);

  _createClass(SlapField, null, [{
    key: 'defaultProps',
    // FIXME: inherit from BaseComponent
    get: function get() {
      return _lodash2.default.merge({}, _BaseComponent2.default.defaultProps, _editorWidget.Field.defaultProps, _opts2.default.editor, _opts2.default.field);
    }
  }]);

  function SlapField(props) {
    _classCallCheck(this, SlapField);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SlapField).call(this, props));

    _this.state = _this.getInitialState(); // only happens automatically with React.createClass, not JS classes
    return _this;
  }

  _createClass(SlapField, [{
    key: 'render',
    value: function render() {
      var self = this;
      var props = self.props;
      var style = props.style;

      return _react2.default.createElement(
        'element',
        { ref: 'root' },
        _react2.default.createElement('box', _extends({ ref: 'foo' }, props.foo))
      );
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var self = this;
      var root = self.refs.root;

      root.focusable = true; // for BaseWidget#focusNext
      self._updateCursor();

      BaseWidget.prototype._initHandlers.apply(root, arguments);
    }
  }]);

  return SlapField;
})(_editorWidget.Field);

exports.default = SlapField;