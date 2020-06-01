'use strict'

import BaseCommand from 'icons8-creator-common/services/history/commands/baseCommand'

export default class DeleteItemCommand extends BaseCommand {
  constructor (model) {
    super()
    this.model = model
    this.model = model
    this.params = this.model.getItem().getAttrs()
  }

  execute () {
    return this.redo()
  }

  async undo () {
    return this.model.addToStage(this.params)
      .then(model => {
        this.model = model
      })
  }

  async redo () {
    await this.model.deleteFromStage()
  }
}
