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

var _BaseComponent2 = require('./BaseComponent');

var _BaseComponent3 = _interopRequireDefault(_BaseComponent2);

var _opts = require('../opts');

var _opts2 = _interopRequireDefault(_opts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Pane = (function (_BaseComponent) {
  _inherits(Pane, _BaseComponent);

  function Pane() {
    _classCallCheck(this, Pane);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Pane).apply(this, arguments));
  }

  _createClass(Pane, [{
    key: 'getInitialState',
    value: function getInitialState() {
      return _lodash2.default.merge({ title: "Untitled pane" }, _get(Object.getPrototypeOf(Pane.prototype), 'getInitialState', this).apply(this, arguments));
    }
  }, {
    key: 'setCurrent',
    value: function setCurrent() {
      var slap = this.context.slap;
      var i = slap.getPaneIndex(self);
      if (i === -1) {
        var panes = slap.panes;
        i = panes.length;
        panes.push(this);
      }
      slap.setState({
        prevPane: slap.state.currentPane,
        currentPane: i
      });
      this.refs.root.focus();
      return this;
    }
  }, {
    key: 'close',
    value: function close() {
      var slap = this.context.slap;
      var i = slap.getPaneIndex(this);
      if (i !== -1) slap.panes.splice(i, 1);
      this.emit('close', i);
      this.refs.root.detach();
      return true;
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.context.slap.setState({ message: null });
      return _get(Object.getPrototypeOf(Pane.prototype), 'componentWillUnmount', this).apply(this, arguments);
    }
  }, {
    key: 'render',
    value: function render() {
      var self = this;
      var props = self.props;
      var slap = self.context.slap;

      return _react2.default.createElement(
        'element',
        _extends({ ref: 'root' }, props),
        props.children,
        _react2.default.createElement('box', _extends({ ref: 'form' }, props.form))
      );
    }
  }], [{
    key: 'defaultProps',
    get: function get() {
      return _lodash2.default.merge({}, _BaseComponent3.default.defaultProps, _opts2.default.pane);
    }
  }]);

  return Pane;
})(_BaseComponent3.default);

exports.default = Pane;