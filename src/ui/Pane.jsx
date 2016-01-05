import _ from 'lodash'
import React from 'react'
import BaseComponent from './BaseComponent'
import opts from '../opts'

export default class Pane extends BaseComponent {
  static get defaultProps () {
    return _.merge({}, BaseComponent.defaultProps, opts.pane)
  }

  getInitialState () {
    return _.merge({title: "Untitled pane"}, super.getInitialState.apply(this, arguments))
  }

  setCurrent () {
    var slap = this.context.slap
    var i = slap.getPaneIndex(self)
    if (i === -1) {
      var panes = slap.panes
      i = panes.length
      panes.push(this)
    }
    slap.setState({
      prevPane: slap.state.currentPane,
      currentPane: i
    })
    this.refs.root.focus()
    return this
  }

  close () {
    var slap = this.context.slap
    var i = slap.getPaneIndex(this)
    if (i !== -1) slap.panes.splice(i, 1)
    this.emit('close', i)
    this.refs.root.detach()
    return true
  }

  componentWillUnmount () {
    this.context.slap.setState({message: null})
    return super.componentWillUnmount.apply(this, arguments)
  }

  render () {
    var self = this
    var props = self.props
    var slap = self.context.slap

    return (
      <element ref="root" {...props}>

        {props.children}

        <box ref="form" {...props.form}></box>

      </element>
    )
  }
}
