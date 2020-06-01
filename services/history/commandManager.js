'use strict'

import BaseService from '../base'
import CollageService from '../collage'

export default class CommandManager extends BaseService {
    static undoStack = []
    static redoStack = []

    static execute (command) {
      this.redoStack = []
      const promise = command.execute()
        .then(() => {
          CollageService.handleSaving(true)
        })

      this.undoStack.push(command)
      this.vuex.dispatch('common/setRedoStackSize', this.redoStack.length)
      this.vuex.dispatch('common/setUndoStackSize', this.undoStack.length)
      return promise
    }

    static add (command) {
      this.redoStack = []
      this.undoStack.push(command)
      this.vuex.dispatch('common/setRedoStackSize', this.redoStack.length)
      this.vuex.dispatch('common/setUndoStackSize', this.undoStack.length)
      CollageService.handleSaving(true)
    }

    static undo () {
      if (!this.undoStack.length) {
        return
      }

      const lastCommand = this.undoStack.pop()
      lastCommand.undo()
        .then(() => {
          CollageService.handleSaving(true)
        })
      this.redoStack.push(lastCommand)

      this.vuex.dispatch('common/setRedoStackSize', this.redoStack.length)
      this.vuex.dispatch('common/setUndoStackSize', this.undoStack.length)
    }

    static redo () {
      if (!this.redoStack.length) {
        return
      }

      const lastCommand = this.redoStack.pop()
      lastCommand.redo()
        .then(() => {
          CollageService.handleSaving(true)
        })
      this.undoStack.push(lastCommand)

      this.vuex.dispatch('common/setRedoStackSize', this.redoStack.length)
      this.vuex.dispatch('common/setUndoStackSize', this.undoStack.length)
    }
}
