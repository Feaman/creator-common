'use strict'

import BaseService from 'icons8-creator-common/services/base'

export default class TextTools extends BaseService {
  static calculatePosition () {
    const activeItem = this.vuex.state.common.currentModel ? this.vuex.state.common.currentModel.getItem() : null
    if (activeItem) {
      const activeItemHeight = activeItem.height() * activeItem.scaleY()
      let top = activeItem.y() - activeItem.height() / 2 - 55
      let left = Math.floor(activeItem.x() - activeItem.width() / 2)

      // If toolbar is outside the upper rim - recalculate Y position
      if (top < 0) {
        top = activeItem.y() + activeItemHeight / 2 + 11
      }

      return {
        top: top + 'px',
        left: left + 'px'
      }
    }
  }
}
