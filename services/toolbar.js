'use strict'

import BaseService from 'icons8-creator-common/services/base'
import StageService from './stage/stage'
import config from '../config'

export default class Toolbar extends BaseService {
  static calculateRotationAngle (currentAngle) {
    if (currentAngle < 0) {
      currentAngle = 360 + currentAngle % 360
    }
    return Math.abs(currentAngle % 360)
  }

  static degreeToRadian (degree) {
    return (degree / 180) * Math.PI
  }

  static getHeight () {
    const currentModel = this.vuex.state.common.currentModel
    const buttonHeight = config.stage.margin.left
    let height = 0

    // Delete button
    height += buttonHeight

    // Layer up/down buttons
    if (this.getLayerableModelsCount() > 1) {
      height += config.stage.margin.left * 2 + 14
    }

    // Flip buttons
    if (currentModel.constructor.getConfig().flippable) {
      height += config.stage.margin.left * 2 + 14
    }

    return height
  }

  static getPropertyModelsCount (property) {
    let modelsCount = 0
    StageService.models.forEach(model => {
      if (model.constructor.getConfig()[property]) {
        modelsCount++
      }
    })
    return modelsCount
  }

  static getLayerableModelsCount () {
    return this.getPropertyModelsCount('layerable')
  }

  static calculatePositionAndSizes () {
    const item = this.vuex.state.common.currentModel ? this.vuex.state.common.currentModel.getItem() : null
    if (item) {
      const stage = StageService.stage
      const itemWidth = item.width() * Math.abs(item.scaleX())
      const itemHeight = item.height() * Math.abs(item.scaleY())
      const rotation = this.calculateRotationAngle(item.rotation())
      const angleCorrection = rotation / 90
      const startingAngle = Math.atan(itemHeight / itemWidth)
      const radius = Math.sqrt(Math.pow(itemWidth, 2) + Math.pow(itemHeight, 2)) / 2
      let angleTotal = this.degreeToRadian(rotation) - startingAngle
      let topCorrection = 0

      // Calculate rotation corrections
      if (rotation > 0 && rotation <= 90) {
        topCorrection = angleCorrection * itemWidth
      } else if (rotation > 90 && rotation <= 180) {
        angleTotal -= this.degreeToRadian(180) - startingAngle * 2
        topCorrection = (angleCorrection - 1) * itemHeight
      } else if (rotation > 180 && rotation <= 270) {
        angleTotal += this.degreeToRadian(180)
        topCorrection = (angleCorrection - 2) * itemWidth
      } else if (rotation > 270 && rotation <= 360) {
        angleTotal += startingAngle * 2
        topCorrection = (angleCorrection - 3) * itemHeight
      }

      // Calculate coordinates, they should be placed in the center of item
      const itemX = item.x()
      const itemY = item.y()

      let left = itemX + radius * Math.cos(angleTotal) + 16
      let top = itemY + radius * Math.sin(angleTotal) - topCorrection

      // Calculate height of toolbar
      const stageMargin = config.stage.margin.left
      const toolbarHeight = this.getHeight()
      if (rotation === 0) {
        if (itemHeight > toolbarHeight) {
          top = itemY - itemHeight / 2 + (itemHeight - toolbarHeight) / 2
        } else {
          top = itemY - itemHeight / 2
        }
      }

      // If toolbar is outside the upper rim - recalculate Y position
      if (top < 0) {
        top = 0
      }

      // If item is outside the bottom rim - recalculate Y position
      if (top + toolbarHeight > stage.height()) {
        top = stage.height() - toolbarHeight
      }

      // Prevent toolbar from positioning outside the right rim
      if (left + stageMargin > stage.width()) {
        left = stage.width() - stageMargin
      }

      return {
        height: toolbarHeight + 'px',
        top: top + 'px',
        left: left + 'px'
      }
    }
  }
}
