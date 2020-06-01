'use strict'

import BaseService from 'icons8-creator-common/services/base'

export default class KeyboardEvents extends BaseService {
  static ENTER = 'ENTER'
  static ESCAPE = 'ESCAPE'
  static DELETE = 'DELETE'
  static BACKSPACE = 'BACKSPACE'
  static ARROW_UP = 'ARROW_UP'
  static ARROW_DOWN = 'ARROW_DOWN'
  static ARROW_LEFT = 'ARROW_LEFT'
  static ARROW_RIGHT = 'ARROW_RIGHT'
  static Z = 'Z'

  static keyboardEvents = {
    [this.Z]: {
      keyCode: 90,
      keys: ['z']
    },
    [this.ENTER]: {
      keyCode: 13,
      keys: ['Enter']
    },
    [this.ESCAPE]: {
      keyCode: 27,
      keys: ['Esc', 'Escape']
    },
    [this.BACKSPACE]: {
      keyCode: 8,
      keys: ['Backspace']
    },
    [this.DELETE]: {
      keyCode: 46,
      keys: ['Delete']
    },
    [this.ARROW_UP]: {
      keyCode: 38,
      keys: ['ArrowUp']
    },
    [this.ARROW_DOWN]: {
      keyCode: 40,
      keys: ['ArrowDown']
    },
    [this.ARROW_LEFT]: {
      keyCode: 37,
      keys: ['ArrowLeft']
    },
    [this.ARROW_RIGHT]: {
      keyCode: 39,
      keys: ['ArrowRight']
    }
  }

  static is (event, keyNames, additionalKey = true) {
    if (!Array.isArray(keyNames)) {
      keyNames = [keyNames]
    }

    let match = false
    keyNames.forEach(keyName => {
      if (
        additionalKey &&
        this.keyboardEvents[keyName] &&
        (
          (event.key && this.keyboardEvents[keyName].keys.includes(event.key)) ||
          this.keyboardEvents[keyName].keyCode === event.keyCode
        )
      ) {
        match = true
      }
    })

    return match
  }
}
