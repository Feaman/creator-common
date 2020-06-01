'use strict'

const defaultConfig = require('icons8-common/src/nuxt.defaults')
const config = Object.assign({}, defaultConfig)
const path = require('path')

config.plugins = [
  path.join(__dirname, '/plugins/init'),
  path.join(__dirname, '/plugins/store'),
  path.join(__dirname, '/plugins/icons'),
  path.join(__dirname, '/plugins/components')
]

config.modules = config.modules || []
config.modules.push(['icons8-common/src/module.js', { 'hreflang': false }])

// To transpile es6 syntax of this module in other projects
const transpile = 'icons8-creator-common'
if (config.build.transpile) {
  config.build.transpile.push(transpile)
} else {
  config.build.transpile = transpile
}

module.exports = config
