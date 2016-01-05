import _ from 'lodash'
import React from 'react'

import BaseWidget from 'base-widget'
import BaseForm from './BaseForm'
import {SlapField} from './SlapField'
import opts from '../opts'

export default class BaseFindForm extends BaseForm {
  static get defaultProps () {
    return _.merge({}, BaseForm.defaultProps, opts.form.baseFind)
  }

  getInitialState () {
    return _.merge({prevEditorState: {}}, super.getInitialState.apply(this, arguments))
  }

  componentDidMount () {
    var self = this

    var textBuf = self.refs.findField.textBuf
    textBuf.onDidChange(() => { self.find(textBuf.getText()) })

    return super.componentDidMount.apply(self, arguments)
  }

  find (text, direction) {
    this.context.slap.header.setState({message: null})
    if (text) this.emit('find', text, direction)
    else this.resetEditor()
    return this
  }

  resetEditor () {
    var prevEditorState = this.state.prevEditorState
    var editor = this.context.pane.refs.editor
    if (prevEditorState.selection) editor.selection.setRange(prevEditorState.selection)
    if (prevEditorState.scroll) {
      editor.scroll = prevEditorState.scroll
      editor.forceUpdate()
    }
  }

  onFindFieldKeypress (ch, key) {
    var text = this.refs.findField.textBuf.getText()
    switch (this.resolveBinding(key)) {
      case 'next': this.find(text, 1); return false
      case 'prev': this.find(text, -1); return false
    }
  }

  onHide () {
    if (!this.context.pane.state.visibleForm) {
      this.setState({prevEditorState: {
        selection: null,
        scroll: null
      }})
    }
  }

  onShow () {
    var prevEditorState = this.state.prevEditorState
    var textBuf = this.refs.findField.textBuf
    var editor = this.context.pane.editor
    if (!prevEditorState.selection) prevEditorState.selection = editor.selection.getRange()
    if (!prevEditorState.scroll) prevEditorState.scroll = editor.scroll
    this.setState({prevEditorState})
    this.findField.focus()
    this.find(textBuf.getText())
  }

  render () {
    return (
      <element ref="root"
        onShow={this.onShow.bind(this)}
        onHide={this.onHide.bind(this)}>

        <SlapField ref="findField" {...this.props.findField}
          onKeypress={this.onFindFieldKeypress.bind(this)} keyable={true}
          top={0}
          left={0}
          right={0} />

      </element>
    )
  }
}
