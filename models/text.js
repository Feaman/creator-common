'use strict'

import BaseModel from '~app/models/base'
import TextService from '../services/text'
import SvgService from '../services/svg'
import ItemsService from 'icons8-creator-common/services/stage/items'

export default class Text extends BaseModel {
  static CLASS_NAME = 'text'
  static TYPE = 'text'

  static config = {
    title: 'text',
    searchable: false,
    transparent: false,
    fetchable: true,
    flippable: false
  }

  static getConfig () {
    return Object.assign({}, BaseModel.getConfig(), this.config || {})
  }

  static fetchItems (entity, params = {}, add = false, forceLoading = true) {
    return TextService.fetchItems(entity)
  }

  static loadFonts () {
    return TextService.loadFonts()
  }

  static getItemId (item) {
    return item.id
  }

  static handleAssetObject (assetObject) {
    return assetObject
  }

  static handleInitialParams (params = {}) {
    const textProperties = params.textProperties
    if (textProperties) {
      params = Object.assign(params, textProperties)
    }
    return params
  }

  static searchSuggest (params) {
    return TextService.filter(params.query)
  }

  static getRecalculatedParams (params, scale) {
    params = this.handleInitialParams(params)
    params = ItemsService.getRecalculatedAttributes(params, scale)
    params.fontSize *= scale
    params.fontSize /= 0.88

    return params
  }

  addToStage (params = {}, ativate = false) {
    return Promise.resolve(TextService.addToStage(this, params, ativate))
  }

  createTransformer (model) {
    const transformer = super.createTransformer(model)
    TextService.handleTransformer(transformer, model)
  }

  changeItem (startAttributes, startActualSizesAndPosition) {
    super.changeItem(startAttributes, startActualSizesAndPosition)
      .then(() => {
        // Set same properties to active textarea, if exists
        const textarea = document.querySelector('.text-edit')
        if (textarea) {
          TextService.setTextareaStyles(textarea, this.getItem())
          TextService.updateTextareaHeight(this, textarea)
        }

        TextService.resizeTextNode(this)
      })
  }

  scale (scale, previousSizesAndPosition) {
    ItemsService.scaleModel(this, scale, previousSizesAndPosition)
    this.getItem().fontSize(this.getItem().fontSize() * Math.abs(scale))
  }

  activateItem () {
    const store = TextService.vuex
    super.activateItem()
    store.dispatch('common/setCurrentCategory', store.state.common.categories.find(category => category.name === this.constructor.CLASS_NAME))
  }

  generateSvgData () {
    return SvgService.handleText(this)
  }

  static clearSearch () {
    const entity = TextService.vuex.state.common.entities.find(entity => entity.name === this.CLASS_NAME)
    this.fetchItems(entity)
  }

  static getAsset (assets, item) {
    return { fontFamily: item.textProperties.fontFamily }
  }
}
