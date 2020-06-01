'use strict'

import config from '~app/config'

let _models = []
let _stage = null

export default class Base {
  static api = null
  static vuex = null
  static router = null
  static route = null
  static error = null
  static events = null
  static $workspace = null
  static $artBoard= null
  static $categories = null
  static $leftPanel = null
  static $tools = null

  static get stage () {
    return _stage
  }
  static set stage (stage) {
    _stage = stage
  }

  static get models () {
    return _models
  }
  static set models (models) {
    _models = models
  }

  static createComponent (componentName) {
    let Component
    const componentPath = config.components[componentName]
    if (componentPath) {
      Component = require(`~app/components/${componentPath}`).default
    } else {
      Component = { render: h => h('') }
    }

    return Component
  }

  static hexToRgba (hex, alpha = 1) {
  // If rgba already
    if (/^rgba/.test(hex)) {
      return hex
    }

    // Check for shortcuts
    if (hex.slice(1).length === 3) {
      hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    }

    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)

    return `rgba(${r},${g},${b},${alpha})`
  }
}
