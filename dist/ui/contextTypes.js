'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Slap = require('./Slap');

var _Slap2 = _interopRequireDefault(_Slap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  slap: _react2.default.PropTypes.instanceOf(_Slap2.default).isRequired
};