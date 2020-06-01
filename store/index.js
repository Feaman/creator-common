import mutations from './mutations'
import actions from './actions'
import config from '../config'

export default {
  namespaced: true,
  state: {
    authChecked: false,
    licenseVerified: false,
    templates: [],
    notifications: {
      items: [],
      total: 0,
      page: 0,
      loading: false
    },
    user: null,
    collages: {
      items: [],
      total: 0,
      page: 0
    },
    currentCollage: null,
    errors: {
      popup: null
    },
    categories: [],
    currentCategory: null,
    entities: [],
    search: {
      query: null,
      isSearch: false,
      suggesting: false
    },
    related: {
      toItem: {
        entities: []
      },
      toStage: {
        items: [],
        entities: []
      }
    },
    autosave: {
      timer: null,
      status: null
    },
    stage: {
      showSizes: false,
      sizesChanging: false
    },
    currentUploads: [],
    history: {
      undoStackSize: 0,
      redoStackSize: 0
    },
    currentModel: null,
    currentModelChanging: false,
    showRightPanel: false,
    artboard: {
      width: 0
    },
    leftPanel: {
      width: config.leftPanel.minWidth,
      columnsQuantity: 3,
      expanded: true,
      floating: true,
      show: false
    },
    styles: [],
    colorPickerColor: false,
    showBackdrop: false,
    isMobile: false
  },
  mutations,
  actions
}
