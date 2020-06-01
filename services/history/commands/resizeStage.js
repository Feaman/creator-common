'use strict'

import BaseCommand from 'icons8-creator-common/services/history/commands/baseCommand'
import StageService from '../../stage/stage'

export default class ResizeStageCommand extends BaseCommand {
  constructor (stageWidth, stageHeight, editSizes = false) {
    super()
    this.startStageWidth = this.constructor.vuex.state.common.stage.realWidth
    this.startStageHeight = this.constructor.vuex.state.common.stage.realHeight
    this.stageWidth = stageWidth
    this.stageHeight = stageHeight
    this.editSizes = editSizes
  }

  execute () {
    return this.redo()
  }

  async undo () {
    await StageService.resize(this.startStageWidth, this.startStageHeight)
  }

  async redo () {
    await StageService.resize(this.stageWidth, this.stageHeight, true, false, this.editSizes)
  }
}
