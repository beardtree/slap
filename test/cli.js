#!/usr/bin/env node
/*global require, global*/

import test from 'tape'
import Promise from 'bluebird'
import util from 'base-widget/spec/util'
global.Promise = Promise; // FIXME: for pathwatcher

import cli from '../lib/cli'
import Slap from '../lib/ui/Slap'

test("cli", function (t) {
  Promise.using(cli({screen: util.createScreen()}), function (slap) {
    t.test("should create an instance of slap", function (st) {
      st.plan(1)

      st.ok(slap instanceof Slap)
    })

    return new Promise(function (resolve) { t.on('end', resolve); })
  }).done()
})
