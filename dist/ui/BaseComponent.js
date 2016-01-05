'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _baseWidget = require('base-widget');

var _baseWidget2 = _interopRequireDefault(_baseWidget);

var _slapUtil = require('slap-util');

var _slapUtil2 = _interopRequireDefault(_slapUtil);

var _contextTypes = require('./contextTypes');

var _contextTypes2 = _interopRequireDefault(_contextTypes);

var _opts = require('../opts');

var _opts2 = _interopRequireDefault(_opts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseComponent = (function (_Component) {
  _inherits(BaseComponent, _Component);

  _createClass(BaseComponent, [{
    key: 'getInitialState',
    value: function getInitialState() {
      return {};
    }
  }], [{
    key: 'defaultProps',
    get: function get() {
      return _lodash2.default.merge({}, _opts2.default.component);
    }
  }, {
    key: 'contextTypes',
    get: function get() {
      return _contextTypes2.default;
    }
  }]);

  function BaseComponent(props) {
    _classCallCheck(this, BaseComponent);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BaseComponent).call(this, props));

    _this.state = _this.getInitialState(); // only happens automatically with React.createClass, not JS classes
    _slapUtil2.default.logger.debug('<' + _slapUtil2.default.typeOf(_this) + ' {' + Object.keys(props) + '} /> (getInitialState: {' + Object.keys(_this.state).join(',') + '})');
    return _this;
  }

  _createClass(BaseComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var self = this;
      _baseWidget2.default.prototype._initHandlers.call(this.refs.root);
    }
  }, {
    key: 'screen',
    get: function get() {
      return this.refs.root.screen;
    }
  }]);

  return BaseComponent;
})(_react.Component);

exports.default = BaseComponent;