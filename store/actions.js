'use strict'

import * as types from './mutations-types'

export default {
  clear ({ commit }) {
    return new Promise(function (resolve) {
      commit(types.CLEAR)
      resolve()
    })
  },
  setUser ({ commit }, user) {
    return new Promise(function (resolve) {
      commit(types.USER_SET, user)
      resolve()
    })
  },
  setCollages ({ commit }, collages) {
    return new Promise(function (resolve) {
      commit(types.COLLAGES_SET, collages)
      resolve()
    })
  },
  setCurrentCollage ({ commit }, currentCollage) {
    return new Promise(function (resolve) {
      commit(types.CURRENT_COLLAGE_SET, currentCollage)
      resolve()
    })
  },
  updateCollage ({ commit }, collage) {
    return new Promise(function (resolve) {
      commit(types.COLLAGE_UPDATED, collage)
      resolve()
    })
  },
  setNotifications ({ commit }, notifications) {
    return new Promise(function (resolve) {
      commit(types.NOTIFICATIONS_SET, notifications)
      resolve()
    })
  },
  setNotification ({ commit }, payload) {
    return new Promise(function (resolve) {
      commit(types.NOTIFICATION_SET, payload)
      resolve()
    })
  },
  setNotificationsLoading ({ commit }, notificationsIsLoandig) {
    return new Promise(function (resolve) {
      commit(types.NOTIFICATIONS_LOADING_SET, notificationsIsLoandig)
      resolve()
    })
  },
  setTemplates ({ commit }, templates) {
    return new Promise(function (resolve) {
      commit(types.TEMPLATES_SET, templates)
      resolve()
    })
  },
  setErrors ({ commit }, errors) {
    return new Promise(function (resolve) {
      commit(types.ERRORS_SET, errors)
      resolve()
    })
  },
  setAuthChecked ({ commit }, isAuthChecked) {
    return new Promise(function (resolve) {
      commit(types.AUTH_CHECKED, isAuthChecked)
      resolve()
    })
  },
  setLicenseVerified ({ commit }, isLicenseVerified) {
    return new Promise(function (resolve) {
      commit(types.LICENSE_VERIFIED, isLicenseVerified)
      resolve()
    })
  },
  setCategories ({ commit }, categories) {
    return new Promise(function (resolve) {
      commit(types.CATEGORIES_SET, categories)
      resolve()
    })
  },
  setCurrentCategory ({ commit }, currentCategory) {
    return new Promise(function (resolve) {
      commit(types.CURRENT_CATEGORY_SET, currentCategory)
      resolve()
    })
  },
  setSearch ({ commit }, searchData) {
    return new Promise(function (resolve) {
      commit(types.SEARCH_SET, searchData)
      resolve()
    })
  },
  clearSearch ({ commit }, searchEntity) {
    return new Promise(function (resolve) {
      commit(types.SEARCH_CLEARED, searchEntity)
      resolve()
    })
  },
  setEntities ({ commit }, entities) {
    return new Promise(function (resolve) {
      commit(types.ENTITIES_SET, entities)
      resolve()
    })
  },
  setEntity ({ commit }, payload) {
    return new Promise(function (resolve) {
      commit(types.ENTITY_SET, payload)
      resolve()
    })
  },
  setAutosaveStatus ({ commit }, autosaveStatus) {
    return new Promise(function (resolve) {
      commit(types.AUTOSAVE_STATUS_SET, autosaveStatus)
      resolve()
    })
  },
  setAutosaveTimer ({ commit }, autosaveTimer) {
    return new Promise(function (resolve) {
      commit(types.AUTOSAVE_TIMER_SET, autosaveTimer)
      resolve()
    })
  },
  setStage ({ commit }, stageData) {
    return new Promise(function (resolve) {
      commit(types.STAGE_SET, stageData)
      resolve()
    })
  },
  setSuggesting ({ commit }, isSuggesting) {
    return new Promise(function (resolve) {
      commit(types.SEARCH_SUGGESTING_SET, isSuggesting)
      resolve()
    })
  },
  setCurrentUpload ({ commit }, upload) {
    return new Promise(function (resolve) {
      commit(types.CURRENT_UPLOAD_SET, upload)
      resolve()
    })
  },
  addCurrentUpload ({ commit }, upload) {
    return new Promise(function (resolve) {
      commit(types.CURRENT_UPLOAD_ADDED, upload)
      resolve()
    })
  },
  setUndoStackSize ({ commit }, size) {
    return new Promise(function (resolve) {
      commit(types.UNDO_STACK_SIZE_SET, size)
      resolve()
    })
  },
  setRedoStackSize ({ commit }, size) {
    return new Promise(function (resolve) {
      commit(types.REDO_STACK_SIZE_SET, size)
      resolve()
    })
  },
  setCurrentModel ({ commit }, currentModel) {
    return new Promise(function (resolve) {
      commit(types.CURRENT_MODEL_SET, currentModel)
      resolve()
    })
  },
  setCurrentModelChanging ({ commit }, isCurrentModelChanging) {
    return new Promise(function (resolve) {
      commit(types.CURRENT_MODEL_CHANGING_SET, isCurrentModelChanging)
      resolve()
    })
  },
  showRightPanel ({ commit }, showRightPanel) {
    return new Promise(function (resolve) {
      commit(types.RIGHT_PANEL_SHOWN, showRightPanel)
      resolve()
    })
  },
  setLeftPanel ({ commit }, leftPanelData) {
    return new Promise(function (resolve) {
      commit(types.LEFT_PANEL_SET, leftPanelData)
      resolve()
    })
  },
  setColorPickerColor ({ commit }, color) {
    return new Promise(function (resolve) {
      commit(types.COLOR_PICKER_INIT_COLOR_SET, color)
      resolve()
    })
  },
  setArtboard ({ commit }, artboardData) {
    return new Promise(function (resolve) {
      commit(types.ARTBOARD_SET, artboardData)
      resolve()
    })
  },
  showBackdrop ({ commit }, show) {
    return new Promise(function (resolve) {
      commit(types.BACKDROP_SHOWN_SET, show)
      resolve()
    })
  },
  setIsMobile ({ commit }, isMobile) {
    return new Promise(function (resolve) {
      commit(types.IS_MOBILE_SET, isMobile)
      resolve()
    })
  }
}
