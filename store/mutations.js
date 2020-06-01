'use strict'

import * as types from './mutations-types'

export default {
  [types.CLEAR] (state) {
    state.search = {
      entities: [],
      query: null,
      isSearch: false,
      suggesting: false
    }
    state.currentModel = null
    state.currentCollage = null
  },
  [types.TEMPLATES_SET] (state, templates) {
    state.templates = templates
  },
  [types.COLLAGES_SET] (state, collages) {
    state.collages = collages
  },
  [types.CURRENT_COLLAGE_SET] (state, currentCollage) {
    state.currentCollage = currentCollage
  },
  [types.COLLAGE_UPDATED] (state, collageData) {
    let collage = state.collages.items.find(collage => collage.id === collageData.id)
    Object.assign(collage, collageData)
  },
  [types.COLLAGES_SET] (state, collages) {
    collages.page = collages.page !== undefined ? collages.page : state.collages.page + 1
    Object.assign(state.collages, collages)
  },
  [types.NOTIFICATIONS_SET] (state, { items, total, page }) {
    page = page !== undefined ? page : state.notifications.page + 1
    state.notifications = { items, total, page }
  },
  [types.NOTIFICATIONS_LOADING_SET] (state, notificationsIsLoading) {
    state.notifications.loading = notificationsIsLoading
  },
  [types.NOTIFICATION_SET] (state, { notification, data }) {
    notification = state.notifications.items.find(notification_ => notification_.id === notification.id)
    if (notification) {
      Object.assign(notification, data)
    }
  },
  [types.AUTH_CHECKED] (state, isAuthChecked) {
    state.authChecked = isAuthChecked
  },
  [types.USER_SET] (state, user) {
    state.user = user
  },
  [types.ERRORS_SET] (state, errors) {
    state.errors = Object.assign(state.errors, errors)
  },
  [types.LICENSE_VERIFIED] (state, isLicenseVerified) {
    state.licenseVerified = isLicenseVerified
  },
  [types.CATEGORIES_SET] (state, categories) {
    state.categories = categories
  },
  [types.CURRENT_CATEGORY_SET] (state, currentCategory) {
    state.currentCategory = currentCategory
  },
  [types.ENTITIES_SET] (state, entities) {
    state.entities = entities
  },
  [types.ENTITY_SET] (state, { entity, data }) {
    Object.assign(state.entities.find(_entity => _entity.name === entity.name), data)
  },
  [types.SEARCH_CLEARED] (state, entity) {
    state.search.isSearch = false
    Object.assign(state.entities.find(_entity => _entity.name === entity.name), {
      searchQuery: null,
      items: [],
      total: 0,
      page: 1
    })
  },
  [types.SEARCH_SET] (state, searchData) {
    state.search = Object.assign(state.search, searchData)
  },
  [types.AUTOSAVE_STATUS_SET] (state, autosaveStatus) {
    state.autosave.status = autosaveStatus
  },
  [types.AUTOSAVE_TIMER_SET] (state, autosaveTimer) {
    state.autosave.timer = autosaveTimer
  },
  [types.STAGE_SET] (state, stageData) {
    state.stage = Object.assign({}, state.stage, stageData)
  },
  [types.SEARCH_SUGGESTING_SET] (state, isSuggesting) {
    state.search.suggesting = isSuggesting
  },
  [types.CURRENT_UPLOAD_ADDED] (state, upload) {
    state.currentUploads.push(upload)
  },
  [types.CURRENT_UPLOAD_SET] (state, upload) {
    Object.assign(state.currentUploads.find(_upload => _upload.id === upload.id), upload)
  },
  [types.UNDO_STACK_SIZE_SET] (state, undoStackSize) {
    state.history.undoStackSize = undoStackSize
  },
  [types.REDO_STACK_SIZE_SET] (state, redoStackSize) {
    state.history.redoStackSize = redoStackSize
  },
  [types.CURRENT_MODEL_SET] (state, currentModel) {
    state.currentModel = currentModel
  },
  [types.CURRENT_MODEL_CHANGING_SET] (state, isCurrentModelChanging) {
    state.currentModelChanging = isCurrentModelChanging
  },
  [types.RIGHT_PANEL_SHOWN] (state, showRightPanel) {
    state.showRightPanel = showRightPanel
  },
  [types.LEFT_PANEL_SET] (state, leftPanelData) {
    state.leftPanel = { ...state.leftPanel, ...leftPanelData }
  },
  [types.COLOR_PICKER_INIT_COLOR_SET] (state, color) {
    state.colorPickerColor = color
  },
  [types.ARTBOARD_SET] (state, artboardData) {
    state.artboard = artboardData
  },
  [types.BACKDROP_SHOWN_SET] (state, show) {
    state.showBackdrop = show
  },
  [types.IS_MOBILE_SET] (state, isMobile) {
    state.isMobile = isMobile
  }
}
