'use strict'

import BaseService from 'icons8-creator-common/services/base'

const nanoid = require('nanoid')

export default class Upload extends BaseService {
  static STATUS_UPLOADING = 'uploading'
  static STATUS_SUCCESS = 'success'
  static STATUS_ERROR = 'error'
  static CORRECT_TYPES = ['image/jpeg', 'image/png']
  static MAX_SIZE = 52428800 // 50 MB in bytes

  static handleUploads (files, event, isLeftSidebarDrop = false) {
    let incorrectTypes = []
    let incorrectSizes = []

    Array.from(files).forEach(file => {
      if (!this.CORRECT_TYPES.includes(file.type)) {
        incorrectTypes.push(file.name)
        return
      }
      if (file.size < this.MAX_SIZE) {
        incorrectSizes.push(file.name)
        return
      }

      let uploadingId = nanoid()
      this.vuex.dispatch('addCurrentUpload', {
        src: URL.createObjectURL(file),
        uploadingId,
        uploadingStatus: this.STATUS_UPLOADING
      })

      // Adding preview before uploading. Not calling a Command so it isn't added to the history.
      // If uploaded through drop on left sidebar, dont image on canvas at all
      if (!isLeftSidebarDrop) {
        // getSizeAndTypeOfImage(file)
        //   .then((res) => {
        // let imageData = this.vuex.state.common.currentUploads[this.vuex.state.common.currentUploads.findIndex(upload => upload.uploadingId === uploadingId)]
        // imageData = { ...imageData, ...res, id: uploadingId, thumb: imageData.src }
        // let params = {}
        // if (event && imageData.type !== itemsService.TYPE_UPLOAD_BACKGROUND) {
        //   params.x = event.clientX - storeService.get('$artBoard').offsetLeft
        //   params.y = event.clientY - config.toolsHeight
        // }
        // if (imageData.type === itemsService.TYPE_UPLOAD_BACKGROUND) {
        //   if (!isBackgroundUpdated) {
        //     backgroundService.handle(imageData, params)
        //     isBackgroundUpdated = true
        //   }
        // } else {
        //   itemsService.handleImage(imageData, params)
        // }
        // })
      }

      let data = new FormData()
      data.append('file', file)

      photosApi.uploadImage(data)
        .then(res => {
          const type = res.upload_type === 'background' ? itemsService.TYPE_UPLOAD_BACKGROUND : itemsService.TYPE_UPLOAD
          storeService.get('vuex').dispatch('updateCurrentUpload',
            {
              uploadingId,
              payload: { ...itemsService.handleAssetObject(type, res), uploadingStatus: STATUS_SUCCESS }
            }
          )
            .then(() => {
            // Adding an actual image to the scene.
              let itemData = storeService.get('vuex').state.editor.currentUploads[storeService.get('vuex').state.editor.currentUploads.findIndex(x => x.uploadingId === uploadingId)]

              // Get actual coordinates since user can move the item while it's loading and remove it afterwards :)
              const itemsLayer = storeService.get('stage').findOne(`#${stageService.ITEMS_LAYER_ID}`)
              let item = itemsLayer.findOne(item => item.getAttrs().objectData && item.getAttrs().objectData.id === uploadingId)

              // TODO: Maybe get item z-index as well?
              let params = {}
              if (item) {
                params.x = item.attrs.x
                params.y = item.attrs.y
              }

              // Separate handling for bg, otherwise it removes current bg.
              // TODO: rewrite this section for better BG handling
              if (item && type === itemsService.TYPE_UPLOAD_BACKGROUND) {
                itemsService.removeItem(item)
                item = null
                storeService.get('commandManager').execute(new AddItemCommand(itemData, params))
              } else if (item) {
                storeService.get('commandManager').execute(new AddItemCommand(itemData, params)).then(() => {
                  itemsService.removeItem(item)
                })
              }

              setTimeout(() => storeService.get('vuex').dispatch('updateCurrentUpload',
                {
                  uploadingId,
                  payload: { uploadingStatus: null }
                }
              ), DISAPPEAR_TIME)
            })
        })
        .catch((error) => {
          console.log('Oops... ' + error)
          storeService.get('vuex').dispatch('updateCurrentUpload',
            {
              uploadingId,
              payload: { uploadingStatus: STATUS_ERROR }
            })

          // TODO: Handle error in a more beautiful way :)
          // Removing preview after uploading. Not calling a command so it isn't added to the history.
          const itemsLayer = storeService.get('stage').findOne(`#${stageService.ITEMS_LAYER_ID}`)
          const item = itemsLayer.findOne(item => item.getAttrs().objectData && item.getAttrs().objectData.id === uploadingId)
          itemsService.removeItem(item)
        })
    })

    storeService.get('vuex')
      .dispatch('errorsSet', { files: { incorrectType: incorrectTypes, incorrectSize: incorrectSizes } })
      .then(() => setTimeout(() => storeService.get('vuex').dispatch('errorsSet', { files: { incorrectSize: [], incorrectType: [] } }), 5000))
  }

  // static getSizeAndTypeOfImage (file) {
  //   return new Promise(resolve => {
  //     let imageObj = new Image()
  //     imageObj.crossOrigin = 'anonymous'
  //     imageObj.src = URL.createObjectURL(file)

  //     imageObj.onload = () => {
  //       const width = imageObj.width
  //       const height = imageObj.height

  //       imageObj = null

  //       resolve({
  //         type,
  //         width,
  //         height
  //       })
  //     }
  //   })
  // }
}
