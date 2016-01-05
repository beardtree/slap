import _ from 'lodash'
import React from 'react'
import Promise from 'bluebird'
import path from 'path'
import blessed from 'blessed'

const fs = Promise.promisifyAll(require('fs'))
const mkdirp = Promise.promisify(require('mkdirp'))

import clap from 'node-clap'
import util from 'slap-util'

import BaseWidget from 'base-widget'
import BaseComponent from './BaseComponent'
// import FileBrowser from './FileBrowser'
import EditorPane from './EditorPane'
import contextTypes from './contextTypes'

import pkg from '../../package'

export default class Slap extends BaseComponent {
  getInitialState () {
    return _.merge({panes: [], currentPane: 0}, super.getInitialState.apply(this, arguments))
  }

  static get childContextTypes () { return contextTypes }
  getChildContext () { return {slap: this} }

  componentDidMount () {
    var self = this
    self._initPlugins().done()
    self.forceUpdate()
    return super.componentDidMount.apply(self, arguments)
  }

  componentWillUpdate (props, state) {
    if (state.currentPane !== this.state.currentPane) state.prevPane = this.state.currentPane
    state.currentPane = Math.min(Math.max(parseInt(state.currentPane || 0), 0), state.panes.length - 1)
  }

  _initPlugins () {
    var self = this

    return Slap.getUserDir()
      .then(userDir => clap({
        val: self,
        module: require.main,
        keyword: 'slap-plugin',
        paths: [path.join(userDir, 'plugins')]
      }))
      .map(obj => obj.promise
        .then(() => { util.logger.info(`loaded plugin ${obj.plugin}`) })
        .catch(err => { util.logger.error(`failed loading plugin ${obj.plugin}: ${err.stack || err}`) }))
  }

  static getUserDir () {
    var userDir = util.resolvePath(`~/.${pkg.name}`)
    return mkdirp(userDir).return(userDir)
  }

  _stopKeyPropagation () {
    // FIXME: ugly hack to stop enter from last keypress from propagating too far
    var self = this
    self.screen.lockKeys = true
    return Promise.delay(0).then(() => { self.screen.lockKeys = false })
  }

  quit () {
    var self = this
    var input = self.screen.program.input || {}
    if (typeof input.unref === 'function') input.unref()
    self.state.panes.forEach(pane => self.closePane(pane))

    // in case the above logic doesn't exit the process, force quit
    setTimeout(() => { process.exit(0) }, 200).unref()

    return this
  }

  getCurrentPane () { return this.state.panes[this.state.currentPane] }
  getPrevPane () {    return this.state.panes[this.state.prevPane] }
  paneForPath (panePath) {
    panePath = util.resolvePath(panePath)
    return this.state.panes.find(openPane => openPane.refs.editor && openPane.refs.editor.textBuf.getPath() === panePath)
  }
  getPaneIndex (pane) { return this.state.panes.indexOf(pane) }
  setCurrentPane (pane) {
    var i = this.getPaneIndex(pane)
    if (i !== -1) self.setState({currentPane: i})
  }
  closePane (pane, ...args) {
    var self = this

    var editor = _.get(pane, 'refs.editor')
    if (editor && editor.textBuf.isModified()) {
      var currentPaneSaveAsCloseForm = (self.getCurrentPane() || {}).refs.saveAsCloseForm || {}
      if (currentPaneSaveAsCloseForm.visible) {
        currentPaneSaveAsCloseForm.once('hide', () => { self.closePane(pane, ...args) })
      } else {
        self.setCurrentPane(pane)
        pane.refs.saveAsCloseForm.show()
      }
      return false
    }

    var panes = this.state.panes
    var i = this.getPaneIndex(pane)
    if (i !== -1) panes.splice(i, 1)
    return true
  }

  open (filePath, current) {
    var self = this
    var pane = self.paneForPath(filePath)
    return Promise.resolve(pane)
      .tap(() => {
        if (pane) return
        if (fs.lstatSync(filePath).isDirectory()) throw _.merge(new Error('EISDIR: illegal operation on a directory, read'), {cause: {code: 'EISDIR'}})
        pane = self.newEditorPane({}, current)
        return pane.refs.editor.open(filePath).return(pane)
      })
      .catch(err => {
        if (pane) self.closePane(pane)
        switch ((err.cause || err).code) {
          case 'EACCES':
            self.setState({message: util.markup(err.message, self.props.header.style.error)})
            break
          case 'EISDIR':
            self.refs.fileBrowser.refresh(filePath, _.noop)
            self.refs.fileBrowser.focus()
            break
          default: throw err
        }
      })
  }

  help () {
    return this
      .open(path.resolve(__dirname, '..', '..', 'README.md'), true)
      .tap(pane => {
        var editor = pane.refs.editor
        editor.setState({readOnly: true})
        editor.textBuf.scan(/^Usage/, match => {
          var start = match.range.start
          editor.selection.setRange([start, start])
          editor.scroll = start.translate([-editor.buffer.options.cursorPadding.top, 0])
          editor.forceUpdate()
          match.stop()
        })
      })
  }

  newEditorPane (props, current) {
    var panes = this.state.panes
    var newState = {panes: panes.concat([<EditorPane {...props} />])}
    if (current) newState.currentPane = panes.length
    this.setState(newState)
  }

  onKeypress (ch, key) {
    var self = this
    var state = self.state
    var props = self.props
    var refs = self.refs
    var panes = state.panes

    util.logger.silly(`keypress ${key.full}${key.full !== key.sequence
      ? ` [raw: ${JSON.stringify(key.sequence)}]`
      : ''}`)

    switch (BaseWidget.prototype.resolveBinding.call({options: props}, key)) {
      case 'new': self.newEditorPane({}, true); return false
      case 'open': refs.fileBrowser.show(); refs.fileBrowser.focus(); return false
      case 'nextPane': self.setState({currentPane: util.mod(state.currentPane + 1, panes.length)}); return false
      case 'prevPane': self.setState({currentPane: util.mod(state.currentPane - 1, panes.length)}); return false
      case 'togglePaneList': self.setState({currentPane: state.currentPane ? null : state.prevPane}); return false
      case 'toggleFileBrowser': refs.fileBrowser.toggle(); return false
      case 'quit':
        if (!self._panesBlockingQuit) {
          var currentPane = self.getCurrentPane()
          if (currentPane) self.closePane(currentPane) // ensures panes[0] doesn't steal focus
          self._panesBlockingQuit = panes.slice().filter(pane => {
            if (!self.closePane(pane)) {
              pane.once('close', () => {
                if (self._panesBlockingQuit) {
                  self._panesBlockingQuit.splice(self._panesBlockingQuit.indexOf(pane), 1)
                  if (self._panesBlockingQuit.length) {
                    self.getCurrentPane().saveAsCloseForm.show()
                  } else {
                    self.quit()
                  }
                }
              })
              pane.refs.saveAsCloseForm.once('cancel', () => {
                self._panesBlockingQuit.forEach(blockingPane => { blockingPane.refs.saveAsCloseForm.hide() })
                self._panesBlockingQuit = null
              })
              return true
            }
          })
          var numPanesBlockingQuit = self._panesBlockingQuit.length
          if (numPanesBlockingQuit > 1) {
            self.setState({message: util.markup(`${numPanesBlockingQuit} unsaved file${numPanesBlockingQuit !== 1 ? "s" : ""}, please save or discard`, props.header.style.warning)})
          } else if (!numPanesBlockingQuit) {
            self.quit()
          }
        }
        return false
      case 'help': self.help(); return false
    }
  }

  onMouse (mouseData) { util.logger.silly("mouse", mouseData) }

  render () {
    var self = this
    var refs = self.refs
    var props = self.props
    var headerPosition = props.header.headerPosition
    var fileBrowserPosition = props.fileBrowser.fileBrowserPosition

    var state = self.state
    var panes = state.panes

    var currentPane = self.getCurrentPane()
    var editor = _.get(currentPane, 'refs.editor')
    var cursor = editor ? editor.selection.getHeadPosition() : null

    var helpBinding = props.bindings.help
    if (Array.isArray(helpBinding)) helpBinding = helpBinding[0]

    return (
      <element ref="root"
        onKeypress={self.onKeypress.bind(self)} keyable={true}
        onMouse={self.onMouse.bind(self)} clickable={true}>

        <box ref="header" {..._.merge(headerPosition === 'top'
              ? {top: 0}
              : {bottom: 0}, props.header)}
          height={1}
          left={0}
          right={0}
          padding={{left: 1, right: 1}}
          tags={true}>

          <box ref="title" {..._.merge({}, props.header, props.header.title)}
            left={0}
            shrink={true}
            tags={true}>

            {`\u270b ${_.get(currentPane, 'state.title', '')}`}

          </box>

          <box ref="headerRight" {..._.merge({}, props.header, props.header.headerRight)}
            right={0}
            shrink={true}
            tags={true}>

            <button ref="helpButton" {...props.helpButton}
              right={0}
              onClick={() => { self.help() }} clickable={true}>
              Help{helpBinding ? `: ${helpBinding}` : ""}
            </button>

            <box ref="info" {..._.merge({}, props.header, props.info)}
              right={_.get(refs, 'helpButton.width', 0) + 1}
              tags={true}
              shrink={true}>

              {cursor ? `${cursor.row+1},${cursor.column+1}` : ''}
              ({editor ? editor.textBuf.getLineCount() : ''})
              {blessed.escape(editor && editor.textBuf.getEncoding() || '')}

              <box show={_.get(editor, 'state.readOnly')} shrink={true}>
                {' '}
                <box ref="readOnly" {...props.header.readOnly} shrink={true}>read-only</box>
              </box>

              <box show={!_.get(editor, 'state.insertMode', true)} shrink={true}>
                {' '}
                <box ref="overwrite" {...props.header.overwrite} shrink={true}>OVR</box>
              </box>

            </box>

            <box ref="message" {...props.header.message}
              right={_.get(refs, 'helpButton.width') + 1 + _.get(refs, 'info.width') + 1}
              padding={{left: 1, right: 1}}
              tags={true}
              shrink={true}>
              {state.message}
            </box>
          </box>
        </box>

        <box ref="main"
          top   ={headerPosition === 'top'    ? 1 : 0}
          bottom={headerPosition === 'bottom' ? 1 : 0}>

          <filemanager ref="fileBrowser" {..._.merge({
              right: {right: 0},
              left: {left: 0}
            }[fileBrowserPosition] || {}, props.fileBrowser)} />

          <box ref="pane"
            left ={_.get(refs, 'fileBrowser.visible') && fileBrowserPosition === 'left'  ? _.get(refs, 'fileBrowser.width') : 0}
            right={_.get(refs, 'fileBrowser.visible') && fileBrowserPosition === 'right' ? _.get(refs, 'fileBrowser.width') : 0}>

            <box ref="paneEmpty" {...props.paneEmpty} show={!currentPane}>

              <box ref="panesOpenMsg"
                left="center"
                width="50%"
                height={1}
                top={1}
                shrink={true}>
                {panes.length} pane{panes.length !== 1 ? 's' : ''} open
              </box>

              <list ref="paneList" {...props.paneList}
                items={_.map(panes, pane => _.get(pane, 'state.title', ''))}
                tags={true}
                onSelect={(title, i) => { self.setState({currentPane: i}) }}
                top={3} />

            </box>

            {currentPane}

          </box>
        </box>
      </element>
    )
  }
}
