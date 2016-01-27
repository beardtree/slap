import _ from 'lodash'
import React from 'react'
import BaseComponent from './BaseComponent'
import opts from '../opts'

export default class Foo extends BaseComponent {
  static get defaultProps () {
    return _.merge({}, opts.foo)
  }

  componentDidMount () {
    var self = this
    return super.componentDidMount.apply(self, arguments)
  }

  render () {
    var self = this
    var props = self.props

    return (
      <element ref="root">
        <box ref="bar" {...props.bar}></box>
      </element>
    )
  }
}
