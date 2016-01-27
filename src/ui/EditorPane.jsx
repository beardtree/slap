import _ from 'lodash'
import blessed from 'blessed'
import path from 'path'
import React from 'react'
import util from 'slap-util'

import {Editor} from 'editor-widget'
import Pane from './Pane'
import SaveAsForm from './SaveAsForm'
import SaveAsCloseForm from './SaveAsCloseForm'
import FindForm from './FindForm'
import GoLineForm from './GoLineForm'

import opts from '../opts'

export default class EditorPane extends Pane {
  static get defaultProps () {
    return _.merge({}, Pane.defaultProps, opts.editorPane)
  }

  componentDidMount () {
    var self = this
    var slap = self.context.slap

    ;(['onDidChange', 'onDidChangePath']).forEach(prop => {
      self.refs.editor.textBuf[prop](() => { self.updateTitle() })
    })
    self.updateTitle()
    util.logger.warn('EditorPane#componentDidMount')

    return super.componentDidMount.apply(self, arguments)
  }

  updateTitle () {
    var self = this
    var textBuf = self.refs.editor.textBuf
    var editorPath = textBuf.getPath()
    var title = editorPath
      ? blessed.escape(path.relative(self.context.slap.refs.fileBrowser.cwd, editorPath))
      : "new file"
    if (textBuf.isModified()) util.markup(`${title}*`, opts.header.style.changed)
    self.setState({title: title.toString()})
    self.context.slap.forceUpdate()
  }

  save (path) {
    var self = this
    var slap = self.context.slap
    var editor = self.refs.editor
    return editor.save(path, slap.refs.fileBrowser.cwd)
      .tap(() => { slap.setState({message: util.markup(`saved to ${editor.textBuf.getPath()}`, opts.header.style.success)}) })
      .catch(err => {
        switch ((err.cause || err).code) {
          case 'EACCES': case 'EISDIR':
            slap.setState({message: util.markup(err.message, opts.header.style.error)})
            break
          default: throw err
        }
      })
  }

  close () {
    var self = this
    var slap = self.context.slap
    if (self.refs.editor.textBuf.isModified()) {
      var currentPane = _.get(slap, 'refs.currentPane')
      if (_.get(currentPane, 'state.visibleForm') === 'saveAsCloseForm') {
        currentPane.on('state', function handleState (state) {
          if (state.visibleForm === 'saveAsCloseForm') return
          self.close()
          currentPane.removeListener('state', handleState)
        })
      } else {
        self.setCurrent()
        self.setState({visibleForm: 'saveAsCloseForm'})
      }
      return false
    }

    return Pane.prototype.close.apply(self, arguments)
  }

  onKeypress (ch, key) {
    var self = this
    var editor = self.refs.editor
    switch (self.resolveBinding(key)) {
      case 'save': if (!editor.state.readOnly) editor.textBuf.getPath() ? self.save().done() : self.setState({visibleForm: 'saveAsForm'}); return false
      case 'saveAs': if (!editor.state.readOnly) self.setState({visibleForm: 'saveAsForm'}); return false
      case 'close': self.close(); return false
      case 'find': self.setState({visibleForm: 'findForm'}); return false
      case 'goLine': self.setState({visibleForm: 'goLineForm'}); return false
    }
  }

  render () {
    var self = this
    var props = self.props

    return (
      <element ref="root"
        onKeypress={self.onKeypress.bind(self)} keyable={true}>

        <Editor ref="editor" {...props.editor} />

        {/*<SaveAsForm>*/}
        {/*<SaveAsCloseForm>*/}
        {/*<FindForm>*/}
        {/*<GoLineForm>*/}

      </element>
    )
  }
}
