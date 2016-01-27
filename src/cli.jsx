#!/usr/bin/env babel-node

import path from 'path'
import _ from 'lodash'
import Promise from 'bluebird'
import ttys from 'ttys'
import util from 'slap-util'

import React, {Component} from 'react'
import blessed from 'blessed'
import {render} from 'react-blessed'

import {Editor} from 'editor-widget'
import Slap from './ui/Slap'
import Pane from './ui/Pane'

import slapOpts from './opts'
import pkg from '../package'

const info = console._error || console.error
const fs = Promise.promisifyAll(require('fs'))

function readAsync (stream) {
  return new Promise((resolve, reject) => {
    var chunks = []
    stream
      .on('error', reject)
      .on('data', data => { chunks.push(data) })
      .on('end', () => { resolve(Buffer.concat(chunks)) })
  })
}

export default Promise.method(function cli (opts) {
  opts = _.merge({}, slapOpts, slapOpts.slap, opts)

  // special invocation modes
  if (opts.perf.profile && process.execArgv.indexOf('--prof') === -1) {
    var cp = require('child_process').fork(process.argv[1], process.argv.slice(2), {
      stdio: 'inherit',
      execArgv: ['--prof'].concat(process.execArgv)
    })
    cp.on('exit', code => { process.exit(code) })
    cp.on('error', err => { process.exit(8) })
    return
  }

  var exit = false
  if (opts.h || opts.help) {
    var command = process.argv[1]
    if (!process.env.PATH.split(path.delimiter).some(binPath => {
      var newCommand = path.relative(binPath, command)
      if (path.dirname(newCommand) === '.') {
        command = newCommand
        return true
      }
    })) {
      command = path.relative(process.cwd(), command)
      if (path.dirname(command) === '.') command = `.${path.sep}${command}`
    }

    info(`
Usage: ${command} [options...] [<file1> [<file2> [...]]]

${pkg.description}

Example: \`${command} file.c\`.
`.trim())

    exit = true
  }

  if (opts.v || opts.version) {
    var SORT_ORDER = ['slap', 'node', 'v8'].reverse()
    var versions = _.clone(process.versions)
    versions[pkg.name] = pkg.version
    info(Object.keys(versions)
      .sort((a, b) => SORT_ORDER.indexOf(b) - SORT_ORDER.indexOf(a))
      .map(name => `${name}@${versions[name]}`)
      .join(", "))
    exit = true
  }

  require('update-notifier')({pkg}).notify()

  if (exit) return process.exit(0)

  return Promise.props({
    userDir: Slap.getUserDir().catch(Promise.resolve()),
    stdin: process.stdin.isTTY ? Promise.resolve('') : readAsync(process.stdin) // read pipe to stdin into a new file if there is one
  }).then(props => {
    var {userDir, stdin} = props
    if (userDir) opts = _.merge({logger: {file: path.resolve(userDir, `${pkg.name}.log`)}}, opts)
    opts = _.merge({editor: {logger: opts.logger}}, opts)
    opts.screenOpts.input = ttys.stdin // Uses ttys to read from /dev/tty
    util.logger(opts.logger)
    util.logger.info("loading...")
    util.logger.verbose("configuration:", opts)

    if (!opts.config) fs // if a user config doesn't exist, make one by copying a template
      .createReadStream(path.resolve(__dirname, '..', 'default-config.ini'))
        .pipe(fs.createWriteStream(path.resolve(userDir, 'config')))

    if (!opts.screen) opts.screen = new blessed.Screen(opts.screenOpts)
    opts.screen.logger = opts.logger

    var slap = render(<Slap {...opts} />, opts.screen)

    Promise.all(opts._.map((positionalArg, i) => slap.open(positionalArg.toString(), !i))).done() // don't return so promise resolves faster

    if (stdin || !opts._.length) { // if no files are passed
      var panes = slap.state.panes
      slap.newPane({type: 'EditorPane', props: {children: stdin.toString()}}, true)
    }

    return slap
  })
})
