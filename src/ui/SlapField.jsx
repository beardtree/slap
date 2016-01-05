import _ from 'lodash'
import React from 'react'
import {Field} from 'editor-widget'
import BaseComponent from './BaseComponent'
import opts from '../opts'

export default class SlapField extends Field { // FIXME: inherit from BaseComponent
  static get defaultProps () {
    return _.merge(
      {},
      BaseComponent.defaultProps,
      Field.defaultProps,
      opts.editor,
      opts.field
    )
  }

  constructor (props) {
    super(props)
    this.state = this.getInitialState() // only happens automatically with React.createClass, not JS classes
  }

  render () {
    var self = this
    var props = self.props
    var style = props.style

    return (
      <element ref="root">
        <box ref="foo" {...props.foo}></box>
      </element>
    )
  }

  componentDidMount () {
    var self = this
    var root = self.refs.root

    root.focusable = true // for BaseWidget#focusNext
    self._updateCursor()

    BaseWidget.prototype._initHandlers.apply(root, arguments)
  }
}
