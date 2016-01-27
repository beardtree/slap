#!/usr/bin/env babel-node
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _ttys = require('ttys');

var _ttys2 = _interopRequireDefault(_ttys);

var _slapUtil = require('slap-util');

var _slapUtil2 = _interopRequireDefault(_slapUtil);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _blessed = require('blessed');

var _blessed2 = _interopRequireDefault(_blessed);

var _reactBlessed = require('react-blessed');

var _editorWidget = require('editor-widget');

var _Slap = require('./ui/Slap');

var _Slap2 = _interopRequireDefault(_Slap);

var _Pane = require('./ui/Pane');

var _Pane2 = _interopRequireDefault(_Pane);

var _opts = require('./opts');

var _opts2 = _interopRequireDefault(_opts);

var _package = require('../package');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var info = console._error || console.error;
var fs = _bluebird2.default.promisifyAll(require('fs'));

function readAsync(stream) {
  return new _bluebird2.default(function (resolve, reject) {
    var chunks = [];
    stream.on('error', reject).on('data', function (data) {
      chunks.push(data);
    }).on('end', function () {
      resolve(Buffer.concat(chunks));
    });
  });
}

exports.default = _bluebird2.default.method(function cli(opts) {
  opts = _lodash2.default.merge({}, _opts2.default, _opts2.default.slap, opts);

  // special invocation modes
  if (opts.perf.profile && process.execArgv.indexOf('--prof') === -1) {
    var cp = require('child_process').fork(process.argv[1], process.argv.slice(2), {
      stdio: 'inherit',
      execArgv: ['--prof'].concat(process.execArgv)
    });
    cp.on('exit', function (code) {
      process.exit(code);
    });
    cp.on('error', function (err) {
      process.exit(8);
    });
    return;
  }

  var exit = false;
  if (opts.h || opts.help) {
    var command = process.argv[1];
    if (!process.env.PATH.split(_path2.default.delimiter).some(function (binPath) {
      var newCommand = _path2.default.relative(binPath, command);
      if (_path2.default.dirname(newCommand) === '.') {
        command = newCommand;
        return true;
      }
    })) {
      command = _path2.default.relative(process.cwd(), command);
      if (_path2.default.dirname(command) === '.') command = '.' + _path2.default.sep + command;
    }

    info(('\nUsage: ' + command + ' [options...] [<file1> [<file2> [...]]]\n\n' + _package2.default.description + '\n\nExample: `' + command + ' file.c`.\n').trim());

    exit = true;
  }

  if (opts.v || opts.version) {
    var SORT_ORDER = ['slap', 'node', 'v8'].reverse();
    var versions = _lodash2.default.clone(process.versions);
    versions[_package2.default.name] = _package2.default.version;
    info(Object.keys(versions).sort(function (a, b) {
      return SORT_ORDER.indexOf(b) - SORT_ORDER.indexOf(a);
    }).map(function (name) {
      return name + '@' + versions[name];
    }).join(", "));
    exit = true;
  }

  require('update-notifier')({ pkg: _package2.default }).notify();

  if (exit) return process.exit(0);

  return _bluebird2.default.props({
    userDir: _Slap2.default.getUserDir().catch(_bluebird2.default.resolve()),
    stdin: process.stdin.isTTY ? _bluebird2.default.resolve('') : readAsync(process.stdin) // read pipe to stdin into a new file if there is one
  }).then(function (props) {
    var userDir = props.userDir;
    var stdin = props.stdin;

    if (userDir) opts = _lodash2.default.merge({ logger: { file: _path2.default.resolve(userDir, _package2.default.name + '.log') } }, opts);
    opts = _lodash2.default.merge({ editor: { logger: opts.logger } }, opts);
    opts.screenOpts.input = _ttys2.default.stdin; // Uses ttys to read from /dev/tty
    _slapUtil2.default.logger(opts.logger);
    _slapUtil2.default.logger.info("loading...");
    _slapUtil2.default.logger.verbose("configuration:", opts);

    if (!opts.config) fs // if a user config doesn't exist, make one by copying a template
    .createReadStream(_path2.default.resolve(__dirname, '..', 'default-config.ini')).pipe(fs.createWriteStream(_path2.default.resolve(userDir, 'config')));

    if (!opts.screen) opts.screen = new _blessed2.default.Screen(opts.screenOpts);
    opts.screen.logger = opts.logger;

    var slap = (0, _reactBlessed.render)(_react2.default.createElement(_Slap2.default, opts), opts.screen);

    _bluebird2.default.all(opts._.map(function (positionalArg, i) {
      return slap.open(positionalArg.toString(), !i);
    })).done(); // don't return so promise resolves faster

    if (stdin || !opts._.length) {
      // if no files are passed
      var panes = slap.state.panes;
      slap.newPane({ type: 'EditorPane', props: { children: stdin.toString() } }, true);
    }

    return slap;
  });
});