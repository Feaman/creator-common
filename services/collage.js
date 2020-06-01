'use strict'

import BaseService from './base'
import StageService from './stage/stage'

export default class User extends BaseService {
  static AUTOSAVE_STATUS_SAVING = 'AUTOSAVE_STATUS_SAVING'
  static AUTOSAVE_STATUS_SAVED = 'AUTOSAVE_STATUS_SAVED'
  static AUTOSAVE_STATUS_ERROR = 'AUTOSAVE_STATUS_ERROR'

  static getCollages (params) {
    return this.api.getCollages(params)
      .then(collagesData => {
        let collages = []
        collagesData.collages.forEach(collage => {
          collages.push(this.handle(collage))
        })
        this.vuex.dispatch('common/setCollages', { items: collages, total: collagesData.total, page: 1 })

        return collages
      })
  }

  static handle (collage) {
    return {
      id: collage.id,
      preview: collage.preview,
      created: collage.createdAt,
      updated: collage.updatedAt,
      isExported: collage.exported,
      mine: collage.mine,
      isDeleting: false,
      isDeleted: false,
      isDuplicating: false,
      deletingTimer: null,
      data: collage.json ? JSON.parse(collage.json).collage : {}
    }
  }

  static delete (collage) {
    this.vuex.dispatch('common/updateCollage', { id: collage.id, isDeleting: true })
    this.api.deleteCollage(collage)
      .then(() => {
        const collages = this.vuex.state.common.collages
        this.vuex.dispatch('common/updateCollage', {
          id: collage.id,
          isDeleting: false,
          isDeleted: true
        })
        this.vuex.dispatch('common/setCollages', { total: collages.total - 1 })
        this.vuex.dispatch('common/updateCollage', {
          id: collage.id,
          deletingTimer: setTimeout(() => {
            this.vuex.dispatch('common/updateCollage', { id: collage.id, deletingTimer: null })
            this.vuex.dispatch('common/setCollages', { items: collages.items.filter(userCollage => userCollage.id !== collage.id) })
          }, 3000)
        })
      })
      .catch(() => {
        this.vuex.dispatch('common/updateCollage', { id: collage.id, isDeleting: false })
      })
  }

  static restore (collage) {
    clearTimeout(collage.deletingTimer)
    this.api.saveCollage({ collage: { deleted: false } }, collage.id)
      .then(() => {
        const collages = this.vuex.state.common.collages
        this.vuex.dispatch('common/updateCollage', {
          id: collage.id,
          deletingTimer: null,
          isDeleted: false
        })
        this.vuex.dispatch('common/setCollages', { total: collages.total + 1 })
      })
  }

  static duplicate (collage, changeUrl = true) {
    this.vuex.dispatch('common/updateCollage', { id: collage.id, isDuplicating: true })
    return this.api.duplicateCollage(collage)
      .then(collageData => {
        const newCollage = this.handle(collageData)
        const collages = [newCollage, ...this.vuex.state.common.collages.items]
        const collagesTotal = this.vuex.state.common.collages.total + 1
        this.vuex.dispatch('common/setCollages', { items: collages, total: collagesTotal, page: 1 })
        this.vuex.dispatch('common/setCurrentCollage', newCollage)
        this.vuex.dispatch('common/updateCollage', { id: collage.id, isDuplicating: false })

        if (changeUrl) {
          history.replaceState({}, null, encodeURI(`/creator/photo/${newCollage.id}`))
        }

        return newCollage
      })
      .catch(() => {
        this.vuex.dispatch('common/updateCollage', { id: collage.id, isDuplicating: false })
      })
  }

  static handleSaving (autoSave = false) {
    try {
      let currentTimer = this.vuex.state.common.autosave.timer

      if (autoSave) {
        // If already timer - clear it to create a new one
        if (currentTimer) {
          this.clearAutosaveTimeout(currentTimer)
        }

        return new Promise(resolve => {
          currentTimer = setTimeout(() => {
            this.clearAutosaveTimeout(currentTimer)
            resolve(this.save())
          }, 1000)
          this.vuex.dispatch('common/setAutosaveTimer', currentTimer)
        })
      } else {
        this.clearAutosaveTimeout(currentTimer)
        return this.save()
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  static async save () {
    try {
      const currentCollage = this.vuex.state.common.currentCollage
      this.vuex.dispatch('common/setAutosaveStatus', this.AUTOSAVE_STATUS_SAVING)

      // Check if current collage belongs to current user
      let currentCollageId
      if (currentCollage && currentCollage.mine) {
        currentCollageId = currentCollage.id
      }

      let params = { collage: StageService.getData() }
      if (this.route.query.recompose) {
        params.parentId = currentCollage.id
      }

      return this.api.saveCollage(params, currentCollageId)
        .then(collageData => {
          this.vuex.dispatch('common/setAutosaveStatus', this.AUTOSAVE_STATUS_SAVED)

          const collage = this.handle(collageData)
          if (!currentCollageId) {
            const items = [collage, ...this.vuex.state.common.collages.items]
            const total = this.vuex.state.common.collages.total + 1
            this.vuex.dispatch('common/setCollages', { items, total, page: 1 })
            history.replaceState({}, null, encodeURI(`/creator/illustration/${collageData.id}`))
            this.vuex.dispatch('common/setCurrentCollage', collage)
          }

          // Save collage preview
          return StageService.getBlob(500, 'image/jpeg', 0.9)
            .then(blob => {
              const formData = new FormData()
              formData.append('file', blob)
              return this.api.saveCollagePreview(formData, collageData.id)
                .then(collagePreview => {
                  const image = new Image()
                  image.src = collagePreview.url
                  this.vuex.dispatch('common/updateCollage', {
                    id: collage.id,
                    preview: collagePreview.url
                  })
                })
            })
        })
        .catch(() => {
          this.vuex.dispatch('common/setAutosaveStatus', this.AUTOSAVE_STATUS_ERROR)
        })
    } catch (error) {
      this.error(error)
      return Promise.reject(error)
    }
  }

  static clearAutosaveTimeout (timeout) {
    clearTimeout(timeout)
    this.vuex.dispatch('common/setAutosaveTimer', null)
  }
}
