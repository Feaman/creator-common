'use strict'

import BaseCommand from './baseCommand'
import StageService from '../../stage/stage'

export default class AddItemCommand extends BaseCommand {
  constructor (model, params = {}, activate = false) {
    super()
    this.params = params
    this.activate = activate
    this.model = model
  }

  execute () {
    return this.redo()
  }

  async undo () {
    const model = StageService.models.find(model => model.id === this.model.id)
    await model.deleteFromStage()
  }

  redo () {
    return this.model.addToStage(this.params, this.activate)
  }
}
