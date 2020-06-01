'use strict'

import BaseService from './base'

export default class Api extends BaseService {
  static defaultParams = {
    per_page: 50
  }

  static errorHandler (error) {
    this.isErrorShown = true
    this.vuex.dispatch('common/setErrors', { popup: 'Oops... ' + error })
    setTimeout(() => {
      this.vuex.dispatch('common/setErrors', { popup: null })
    }, 8000)
  }

  static getApiHeader (cookie = null) {
    const store = this.vuex.state.common
    let apiKey
    if (store.user && store.user.roles.find(role => role === 'guest')) {
      apiKey = store.user.api_key
    }
    let headers
    if (cookie) {
      headers = {
        cookie: cookie
      }
    }

    if (apiKey) {
      return { 'Api-Key': apiKey }
    } else if (headers) {
      return headers
    } else {
      return {}
    }
  }

  static getCategories () {
    return Promise.resolve([])
  }

  static getStyles () {
    return Promise.resolve([])
  }

  static getUser () {
    return Promise.resolve(null)
  }

  static getCollages () {
    return Promise.resolve({
      collages: [],
      total: 0
    })
  }

  static getCollage () {
    return Promise.resolve(null)
  }

  static duplicateCollage () {
    return Promise.resolve(null)
  }

  static deleteCollage () {
    return Promise.resolve()
  }

  static saveCollage (params, collageId) {
    return Promise.resolve()
  }

  static saveCollagePreview () {
    return Promise.resolve(null)
  }

  static saveCollageSvg () {
    return Promise.resolve(null)
  }

  static getTemplates () {
    return Promise.resolve({
      templates: [],
      total: 0
    })
  }

  static getNotifications () {
    return Promise.resolve({
      notifications: [],
      total: 0
    })
  }

  static markNotificationAsRead (notification) {
    return Promise.resolve({})
  }

  static searchSuggest (params) {
    return Promise.resolve([])
  }

  static getByEntity (entity, params) {
    return Promise.resolve([])
  }

  static getCollageSources (collage) {
    return Promise.resolve([])
  }
}
