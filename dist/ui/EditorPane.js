'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _blessed = require('blessed');

var _blessed2 = _interopRequireDefault(_blessed);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _slapUtil = require('slap-util');

var _slapUtil2 = _interopRequireDefault(_slapUtil);

var _editorWidget = require('editor-widget');

var _Pane2 = require('./Pane');

var _Pane3 = _interopRequireDefault(_Pane2);

var _SaveAsForm = require('./SaveAsForm');

var _SaveAsForm2 = _interopRequireDefault(_SaveAsForm);

var _SaveAsCloseForm = require('./SaveAsCloseForm');

var _SaveAsCloseForm2 = _interopRequireDefault(_SaveAsCloseForm);

var _FindForm = require('./FindForm');

var _FindForm2 = _interopRequireDefault(_FindForm);

var _GoLineForm = require('./GoLineForm');

var _GoLineForm2 = _interopRequireDefault(_GoLineForm);

var _opts = require('../opts');

var _opts2 = _interopRequireDefault(_opts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EditorPane = (function (_Pane) {
  _inherits(EditorPane, _Pane);

  function EditorPane() {
    _classCallCheck(this, EditorPane);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(EditorPane).apply(this, arguments));
  }

  _createClass(EditorPane, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var self = this;
      var slap = self.context.slap;['onDidChange', 'onDidChangePath'].forEach(function (prop) {
        self.refs.editor.textBuf[prop](function () {
          self.updateTitle();
        });
      });
      self.updateTitle();
      _slapUtil2.default.logger.warn('EditorPane#componentDidMount');

      return _get(Object.getPrototypeOf(EditorPane.prototype), 'componentDidMount', this).apply(self, arguments);
    }
  }, {
    key: 'updateTitle',
    value: function updateTitle() {
      var self = this;
      var textBuf = self.refs.editor.textBuf;
      var editorPath = textBuf.getPath();
      var title = editorPath ? _blessed2.default.escape(_path2.default.relative(self.context.slap.refs.fileBrowser.cwd, editorPath)) : "new file";
      if (textBuf.isModified()) _slapUtil2.default.markup(title + '*', _opts2.default.header.style.changed);
      self.setState({ title: title.toString() });
      self.context.slap.forceUpdate();
    }
  }, {
    key: 'save',
    value: function save(path) {
      var self = this;
      var slap = self.context.slap;
      var editor = self.refs.editor;
      return editor.save(path, slap.refs.fileBrowser.cwd).tap(function () {
        slap.setState({ message: _slapUtil2.default.markup('saved to ' + editor.textBuf.getPath(), _opts2.default.header.style.success) });
      }).catch(function (err) {
        switch ((err.cause || err).code) {
          case 'EACCES':case 'EISDIR':
            slap.setState({ message: _slapUtil2.default.markup(err.message, _opts2.default.header.style.error) });
            break;
          default:
            throw err;
        }
      });
    }
  }, {
    key: 'close',
    value: function close() {
      var self = this;
      var slap = self.context.slap;
      if (self.refs.editor.textBuf.isModified()) {
        var currentPane = _lodash2.default.get(slap, 'refs.currentPane');
        if (_lodash2.default.get(currentPane, 'state.visibleForm') === 'saveAsCloseForm') {
          currentPane.on('state', function handleState(state) {
            if (state.visibleForm === 'saveAsCloseForm') return;
            self.close();
            currentPane.removeListener('state', handleState);
          });
        } else {
          self.setCurrent();
          self.setState({ visibleForm: 'saveAsCloseForm' });
        }
        return false;
      }

      return _Pane3.default.prototype.close.apply(self, arguments);
    }
  }, {
    key: 'onKeypress',
    value: function onKeypress(ch, key) {
      var self = this;
      var editor = self.refs.editor;
      switch (self.resolveBinding(key)) {
        case 'save':
          if (!editor.state.readOnly) editor.textBuf.getPath() ? self.save().done() : self.setState({ visibleForm: 'saveAsForm' });return false;
        case 'saveAs':
          if (!editor.state.readOnly) self.setState({ visibleForm: 'saveAsForm' });return false;
        case 'close':
          self.close();return false;
        case 'find':
          self.setState({ visibleForm: 'findForm' });return false;
        case 'goLine':
          self.setState({ visibleForm: 'goLineForm' });return false;
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var self = this;
      var props = self.props;

      return _react2.default.createElement(
        'element',
        { ref: 'root',
          onKeypress: self.onKeypress.bind(self), keyable: true },
        _react2.default.createElement(_editorWidget.Editor, _extends({ ref: 'editor' }, props.editor))
      );
    }
  }], [{
    key: 'defaultProps',
    get: function get() {
      return _lodash2.default.merge({}, _Pane3.default.defaultProps, _opts2.default.editorPane);
    }
  }]);

  return EditorPane;
})(_Pane3.default);

exports.default = EditorPane;