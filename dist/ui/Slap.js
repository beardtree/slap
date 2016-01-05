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

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _blessed = require('blessed');

var _blessed2 = _interopRequireDefault(_blessed);

var _nodeClap = require('node-clap');

var _nodeClap2 = _interopRequireDefault(_nodeClap);

var _slapUtil = require('slap-util');

var _slapUtil2 = _interopRequireDefault(_slapUtil);

var _baseWidget = require('base-widget');

var _baseWidget2 = _interopRequireDefault(_baseWidget);

var _BaseComponent2 = require('./BaseComponent');

var _BaseComponent3 = _interopRequireDefault(_BaseComponent2);

var _EditorPane = require('./EditorPane');

var _EditorPane2 = _interopRequireDefault(_EditorPane);

var _contextTypes = require('./contextTypes');

var _contextTypes2 = _interopRequireDefault(_contextTypes);

var _package = require('../../package');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var fs = _bluebird2.default.promisifyAll(require('fs'));
var mkdirp = _bluebird2.default.promisify(require('mkdirp'));
// import FileBrowser from './FileBrowser'

var Slap = (function (_BaseComponent) {
  _inherits(Slap, _BaseComponent);

  function Slap() {
    _classCallCheck(this, Slap);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Slap).apply(this, arguments));
  }

  _createClass(Slap, [{
    key: 'getInitialState',
    value: function getInitialState() {
      return _lodash2.default.merge({ panes: [], currentPane: 0 }, _get(Object.getPrototypeOf(Slap.prototype), 'getInitialState', this).apply(this, arguments));
    }
  }, {
    key: 'getChildContext',
    value: function getChildContext() {
      return { slap: this };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var self = this;
      self._initPlugins().done();
      self.forceUpdate();
      return _get(Object.getPrototypeOf(Slap.prototype), 'componentDidMount', this).apply(self, arguments);
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(props, state) {
      if (state.currentPane !== this.state.currentPane) state.prevPane = this.state.currentPane;
      state.currentPane = Math.min(Math.max(parseInt(state.currentPane || 0), 0), state.panes.length - 1);
    }
  }, {
    key: '_initPlugins',
    value: function _initPlugins() {
      var self = this;

      return Slap.getUserDir().then(function (userDir) {
        return (0, _nodeClap2.default)({
          val: self,
          module: require.main,
          keyword: 'slap-plugin',
          paths: [_path2.default.join(userDir, 'plugins')]
        });
      }).map(function (obj) {
        return obj.promise.then(function () {
          _slapUtil2.default.logger.info('loaded plugin ' + obj.plugin);
        }).catch(function (err) {
          _slapUtil2.default.logger.error('failed loading plugin ' + obj.plugin + ': ' + (err.stack || err));
        });
      });
    }
  }, {
    key: '_stopKeyPropagation',
    value: function _stopKeyPropagation() {
      // FIXME: ugly hack to stop enter from last keypress from propagating too far
      var self = this;
      self.screen.lockKeys = true;
      return _bluebird2.default.delay(0).then(function () {
        self.screen.lockKeys = false;
      });
    }
  }, {
    key: 'quit',
    value: function quit() {
      var self = this;
      var input = self.screen.program.input || {};
      if (typeof input.unref === 'function') input.unref();
      self.state.panes.forEach(function (pane) {
        return self.closePane(pane);
      });

      // in case the above logic doesn't exit the process, force quit
      setTimeout(function () {
        process.exit(0);
      }, 200).unref();

      return this;
    }
  }, {
    key: 'getCurrentPane',
    value: function getCurrentPane() {
      return this.state.panes[this.state.currentPane];
    }
  }, {
    key: 'getPrevPane',
    value: function getPrevPane() {
      return this.state.panes[this.state.prevPane];
    }
  }, {
    key: 'paneForPath',
    value: function paneForPath(panePath) {
      panePath = _slapUtil2.default.resolvePath(panePath);
      return this.state.panes.find(function (openPane) {
        return openPane.refs.editor && openPane.refs.editor.textBuf.getPath() === panePath;
      });
    }
  }, {
    key: 'getPaneIndex',
    value: function getPaneIndex(pane) {
      return this.state.panes.indexOf(pane);
    }
  }, {
    key: 'setCurrentPane',
    value: function setCurrentPane(pane) {
      var i = this.getPaneIndex(pane);
      if (i !== -1) self.setState({ currentPane: i });
    }
  }, {
    key: 'closePane',
    value: function closePane(pane) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var self = this;

      var editor = _lodash2.default.get(pane, 'refs.editor');
      if (editor && editor.textBuf.isModified()) {
        var currentPaneSaveAsCloseForm = (self.getCurrentPane() || {}).refs.saveAsCloseForm || {};
        if (currentPaneSaveAsCloseForm.visible) {
          currentPaneSaveAsCloseForm.once('hide', function () {
            self.closePane.apply(self, [pane].concat(args));
          });
        } else {
          self.setCurrentPane(pane);
          pane.refs.saveAsCloseForm.show();
        }
        return false;
      }

      var panes = this.state.panes;
      var i = this.getPaneIndex(pane);
      if (i !== -1) panes.splice(i, 1);
      return true;
    }
  }, {
    key: 'open',
    value: function open(filePath, current) {
      var self = this;
      var pane = self.paneForPath(filePath);
      return _bluebird2.default.resolve(pane).tap(function () {
        if (pane) return;
        if (fs.lstatSync(filePath).isDirectory()) throw _lodash2.default.merge(new Error('EISDIR: illegal operation on a directory, read'), { cause: { code: 'EISDIR' } });
        pane = self.newEditorPane({}, current);
        return pane.refs.editor.open(filePath).return(pane);
      }).catch(function (err) {
        if (pane) self.closePane(pane);
        switch ((err.cause || err).code) {
          case 'EACCES':
            self.setState({ message: _slapUtil2.default.markup(err.message, self.props.header.style.error) });
            break;
          case 'EISDIR':
            self.refs.fileBrowser.refresh(filePath, _lodash2.default.noop);
            self.refs.fileBrowser.focus();
            break;
          default:
            throw err;
        }
      });
    }
  }, {
    key: 'help',
    value: function help() {
      return this.open(_path2.default.resolve(__dirname, '..', '..', 'README.md'), true).tap(function (pane) {
        var editor = pane.refs.editor;
        editor.setState({ readOnly: true });
        editor.textBuf.scan(/^Usage/, function (match) {
          var start = match.range.start;
          editor.selection.setRange([start, start]);
          editor.scroll = start.translate([-editor.buffer.options.cursorPadding.top, 0]);
          editor.forceUpdate();
          match.stop();
        });
      });
    }
  }, {
    key: 'newEditorPane',
    value: function newEditorPane(props, current) {
      var panes = this.state.panes;
      var newState = { panes: panes.concat([_react2.default.createElement(_EditorPane2.default, props)]) };
      if (current) newState.currentPane = panes.length;
      this.setState(newState);
    }
  }, {
    key: 'onKeypress',
    value: function onKeypress(ch, key) {
      var self = this;
      var state = self.state;
      var props = self.props;
      var refs = self.refs;
      var panes = state.panes;

      _slapUtil2.default.logger.silly('keypress ' + key.full + (key.full !== key.sequence ? ' [raw: ' + JSON.stringify(key.sequence) + ']' : ''));

      switch (_baseWidget2.default.prototype.resolveBinding.call({ options: props }, key)) {
        case 'new':
          self.newEditorPane({}, true);return false;
        case 'open':
          refs.fileBrowser.show();refs.fileBrowser.focus();return false;
        case 'nextPane':
          self.setState({ currentPane: _slapUtil2.default.mod(state.currentPane + 1, panes.length) });return false;
        case 'prevPane':
          self.setState({ currentPane: _slapUtil2.default.mod(state.currentPane - 1, panes.length) });return false;
        case 'togglePaneList':
          self.setState({ currentPane: state.currentPane ? null : state.prevPane });return false;
        case 'toggleFileBrowser':
          refs.fileBrowser.toggle();return false;
        case 'quit':
          if (!self._panesBlockingQuit) {
            var currentPane = self.getCurrentPane();
            if (currentPane) self.closePane(currentPane); // ensures panes[0] doesn't steal focus
            self._panesBlockingQuit = panes.slice().filter(function (pane) {
              if (!self.closePane(pane)) {
                pane.once('close', function () {
                  if (self._panesBlockingQuit) {
                    self._panesBlockingQuit.splice(self._panesBlockingQuit.indexOf(pane), 1);
                    if (self._panesBlockingQuit.length) {
                      self.getCurrentPane().saveAsCloseForm.show();
                    } else {
                      self.quit();
                    }
                  }
                });
                pane.refs.saveAsCloseForm.once('cancel', function () {
                  self._panesBlockingQuit.forEach(function (blockingPane) {
                    blockingPane.refs.saveAsCloseForm.hide();
                  });
                  self._panesBlockingQuit = null;
                });
                return true;
              }
            });
            var numPanesBlockingQuit = self._panesBlockingQuit.length;
            if (numPanesBlockingQuit > 1) {
              self.setState({ message: _slapUtil2.default.markup(numPanesBlockingQuit + ' unsaved file' + (numPanesBlockingQuit !== 1 ? "s" : "") + ', please save or discard', props.header.style.warning) });
            } else if (!numPanesBlockingQuit) {
              self.quit();
            }
          }
          return false;
        case 'help':
          self.help();return false;
      }
    }
  }, {
    key: 'onMouse',
    value: function onMouse(mouseData) {
      _slapUtil2.default.logger.silly("mouse", mouseData);
    }
  }, {
    key: 'render',
    value: function render() {
      var self = this;
      var refs = self.refs;
      var props = self.props;
      var headerPosition = props.header.headerPosition;
      var fileBrowserPosition = props.fileBrowser.fileBrowserPosition;

      var state = self.state;
      var panes = state.panes;

      var currentPane = self.getCurrentPane();
      var editor = _lodash2.default.get(currentPane, 'refs.editor');
      var cursor = editor ? editor.selection.getHeadPosition() : null;

      var helpBinding = props.bindings.help;
      if (Array.isArray(helpBinding)) helpBinding = helpBinding[0];

      return _react2.default.createElement(
        'element',
        { ref: 'root',
          onKeypress: self.onKeypress.bind(self), keyable: true,
          onMouse: self.onMouse.bind(self), clickable: true },
        _react2.default.createElement(
          'box',
          _extends({ ref: 'header' }, _lodash2.default.merge(headerPosition === 'top' ? { top: 0 } : { bottom: 0 }, props.header), {
            height: 1,
            left: 0,
            right: 0,
            padding: { left: 1, right: 1 },
            tags: true }),
          _react2.default.createElement(
            'box',
            _extends({ ref: 'title' }, _lodash2.default.merge({}, props.header, props.header.title), {
              left: 0,
              shrink: true,
              tags: true }),
            '✋ ' + _lodash2.default.get(currentPane, 'state.title', '')
          ),
          _react2.default.createElement(
            'box',
            _extends({ ref: 'headerRight' }, _lodash2.default.merge({}, props.header, props.header.headerRight), {
              right: 0,
              shrink: true,
              tags: true }),
            _react2.default.createElement(
              'button',
              _extends({ ref: 'helpButton' }, props.helpButton, {
                right: 0,
                onClick: function onClick() {
                  self.help();
                }, clickable: true }),
              'Help',
              helpBinding ? ': ' + helpBinding : ""
            ),
            _react2.default.createElement(
              'box',
              _extends({ ref: 'info' }, _lodash2.default.merge({}, props.header, props.info), {
                right: _lodash2.default.get(refs, 'helpButton.width', 0) + 1,
                tags: true,
                shrink: true }),
              cursor ? cursor.row + 1 + ',' + (cursor.column + 1) : '',
              '(',
              editor ? editor.textBuf.getLineCount() : '',
              ')',
              _blessed2.default.escape(editor && editor.textBuf.getEncoding() || ''),
              _react2.default.createElement(
                'box',
                { show: _lodash2.default.get(editor, 'state.readOnly'), shrink: true },
                ' ',
                _react2.default.createElement(
                  'box',
                  _extends({ ref: 'readOnly' }, props.header.readOnly, { shrink: true }),
                  'read-only'
                )
              ),
              _react2.default.createElement(
                'box',
                { show: !_lodash2.default.get(editor, 'state.insertMode', true), shrink: true },
                ' ',
                _react2.default.createElement(
                  'box',
                  _extends({ ref: 'overwrite' }, props.header.overwrite, { shrink: true }),
                  'OVR'
                )
              )
            ),
            _react2.default.createElement(
              'box',
              _extends({ ref: 'message' }, props.header.message, {
                right: _lodash2.default.get(refs, 'helpButton.width') + 1 + _lodash2.default.get(refs, 'info.width') + 1,
                padding: { left: 1, right: 1 },
                tags: true,
                shrink: true }),
              state.message
            )
          )
        ),
        _react2.default.createElement(
          'box',
          { ref: 'main',
            top: headerPosition === 'top' ? 1 : 0,
            bottom: headerPosition === 'bottom' ? 1 : 0 },
          _react2.default.createElement('filemanager', _extends({ ref: 'fileBrowser' }, _lodash2.default.merge(({
            right: { right: 0 },
            left: { left: 0 }
          })[fileBrowserPosition] || {}, props.fileBrowser))),
          _react2.default.createElement(
            'box',
            { ref: 'pane',
              left: _lodash2.default.get(refs, 'fileBrowser.visible') && fileBrowserPosition === 'left' ? _lodash2.default.get(refs, 'fileBrowser.width') : 0,
              right: _lodash2.default.get(refs, 'fileBrowser.visible') && fileBrowserPosition === 'right' ? _lodash2.default.get(refs, 'fileBrowser.width') : 0 },
            _react2.default.createElement(
              'box',
              _extends({ ref: 'paneEmpty' }, props.paneEmpty, { show: !currentPane }),
              _react2.default.createElement(
                'box',
                { ref: 'panesOpenMsg',
                  left: 'center',
                  width: '50%',
                  height: 1,
                  top: 1,
                  shrink: true },
                panes.length,
                ' pane',
                panes.length !== 1 ? 's' : '',
                ' open'
              ),
              _react2.default.createElement('list', _extends({ ref: 'paneList' }, props.paneList, {
                items: _lodash2.default.map(panes, function (pane) {
                  return _lodash2.default.get(pane, 'state.title', '');
                }),
                tags: true,
                onSelect: function onSelect(title, i) {
                  self.setState({ currentPane: i });
                },
                top: 3 }))
            ),
            currentPane
          )
        )
      );
    }
  }], [{
    key: 'getUserDir',
    value: function getUserDir() {
      var userDir = _slapUtil2.default.resolvePath('~/.' + _package2.default.name);
      return mkdirp(userDir).return(userDir);
    }
  }, {
    key: 'childContextTypes',
    get: function get() {
      return _contextTypes2.default;
    }
  }]);

  return Slap;
})(_BaseComponent3.default);

exports.default = Slap;