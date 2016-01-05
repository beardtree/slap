import _ from 'lodash'
import React from 'react'

import BaseComponent from './BaseComponent'
import opts from '../opts'

export default class BaseForm extends BaseComponent {
  static get defaultProps () {
    return _.merge({}, BaseComponent.defaultProps, opts.form)
  }

  cancel () { this.emit('cancel') }
  submit () { this.emit('submit') }

  onKeypress (ch, key) {
    switch (self.resolveBinding(key)) {
      case 'cancel': self.cancel(); return false
    }
  }

  onHide () {
    this.context.slap._stopKeyPropagation().done()
    if (this.screen.focused.hasAncestor(this.context.pane) && !this.screen.focused.visible) this.context.pane.focus()
  }

  render () {
    var self = this

    return (
      <element ref="root"
        onShow={() => { self.focus() }}
        onHide={self.onHide.bind(self)}
        onBlur={() => { if (self.visible && !self.hasFocus(true)) self.cancel() }}
        onSubmit={() => { self.submit() }}
        onCancel={() => { self.cancel(); self.hide() }}
        onKeypress={self.onKeypress.bind(self)} keyable={true}
        hidden={true}
        height={1}
        left={0}
        right={0}
        bottom={0}>
      </element>
    )
  }
}
