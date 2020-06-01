'use strict'

import BaseCommand from 'icons8-creator-common/services/history/commands/baseCommand'
import StageService from 'icons8-creator-common/services/stage/stage'

export default class ChangeItemCommand extends BaseCommand {
  constructor (model, startAttributes, endAttributes) {
    super()
    this.startActualSizesAndPosition = StageService.getActualSizesAndPosition()
    this.model = model
    this.startAttributes = Object.assign({}, startAttributes)
    this.endAttributes = Object.assign({}, endAttributes)
  }

  execute () {
    return this.redo()
  }

  async undo () {
    const model = StageService.models.find(model => model.id === this.model.id)
    await model.changeItem(this.startAttributes, this.startActualSizesAndPosition)
  }

  async redo () {
    const model = StageService.models.find(model => model.id === this.model.id)
    await model.changeItem(this.endAttributes, this.startActualSizesAndPosition)
  }
}
