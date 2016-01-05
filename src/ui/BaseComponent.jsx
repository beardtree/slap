'use strict'

import _ from 'lodash'
import React, {Component} from 'react'
import BaseWidget from 'base-widget'
import util from 'slap-util'

import contextTypes from './contextTypes'
import opts from '../opts'

export default class BaseComponent extends Component {
  static get defaultProps () {
    return _.merge({}, opts.component)
  }

  getInitialState () { return {} }

  static get contextTypes () { return contextTypes }

  constructor (props) {
    super(props)
    this.state = this.getInitialState() // only happens automatically with React.createClass, not JS classes
    util.logger.debug(`<${util.typeOf(this)} {${Object.keys(props)}} /> (getInitialState: {${Object.keys(this.state).join(',')}})`)
  }

  componentDidMount () {
    var self = this
    BaseWidget.prototype._initHandlers.call(this.refs.root)
  }

  get screen () { return this.refs.root.screen }
}
