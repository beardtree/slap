'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _rc = require('rc');

var _rc2 = _interopRequireDefault(_rc);

var _slapUtil = require('slap-util');

var _slapUtil2 = _interopRequireDefault(_slapUtil);

var _package = require('../package');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var configFile = _path2.default.resolve(__dirname, '..', _package2.default.name + '.ini');
exports.default = _slapUtil2.default.parseOpts((0, _rc2.default)(_package2.default.name, configFile));