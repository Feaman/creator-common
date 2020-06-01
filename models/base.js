'use strict'

import StageService from 'icons8-creator-common/services/stage/stage'
import ItemsService from 'icons8-creator-common/services/stage/items'
import EntityService from '../services/entity'
import config from '../config'

const nanoid = require('nanoid')

export default class Base {
  static CLASS_NAME = ''
  static TYPE = ''

  static config = {
    title: 'Base Model',
    api: {
      url: '',
      field: ''
    },
    icon: '',
    searchable: true,
    transparent: true,
    fetchable: true,
    layerable: true,
    flippable: true,
    listItemPadding: 12
  }

  static getDefaultFilterParams () {
    return {}
  }

  constructor (assetObject = {}) {
    this.data = this.constructor.handleAssetObject(assetObject)
    this.id = nanoid()
  }

  static getConfig () {
    return this.config
  }

  static initDefaultBackground (fillColor) {
    return StageService.initDefaultBackground(fillColor)
  }

  static handleInitialParams (params = {}) {
    return params
  }

  static getRecalculatedParams (attributes, scale) {
    return ItemsService.getRecalculatedAttributes(this.handleInitialParams(attributes), scale)
  }

  static search (query) {
    return EntityService.search(query)
  }

  static clearSearch () {
    const entity = EntityService.vuex.state.common.entities.find(entity => entity.name === this.CLASS_NAME)
    EntityService.setEntity(entity, { items: [], total: 0, page: 1 })
  }

  static searchSuggest (query) {
    return EntityService.searchSuggest(query)
  }

  static getFilterParams (filters = {}) {
    return Object.assign(this.getDefaultFilterParams(), filters)
  }

  static getSortings () {
    return []
  }

  static getSortingParams () {
    return {}
  }

  static fetchNextPage (entityStore) {
    return EntityService.fetchNextPage(EntityService.getEntityByNameAndStore(this.CLASS_NAME, entityStore))
  }

  static getListItemHeight (item, containerWidth, columnsQuantity) {
    let width = this.getListItemWidth(containerWidth, columnsQuantity)
    let widthRatio = width / (item.width + this.getConfig().listItemPadding * 2)
    let height = (item.height + this.getConfig().listItemPadding * 2) * widthRatio

    // If picture is too tall
    if (height / width > config.itemMaxRatio) {
      height = width * config.itemMaxRatio
    }

    return height
  }

  static getListItemWidth (containerWidth, columnsQuantity) {
    const listWidth = containerWidth
    const guttersWidth = columnsQuantity > 1 ? (columnsQuantity - 1) * 4 : 0
    return (listWidth - guttersWidth) / columnsQuantity
  }

  static fetchItems (entity, params = {}, add = false, forceLoading = true) {
    return EntityService.fetchItems(entity, params, add, forceLoading)
  }

  static getItemId (item) {
    return item.id
  }

  static handleAssetObject (assetObject) {
    return {
      id: assetObject.id,
      pretty_id: assetObject.pretty_id,
      thumb: assetObject.thumb1x.url,
      url: assetObject.thumb1x.url,
      width: assetObject.thumb1x.width,
      height: assetObject.thumb1x.height
    }
  }

  preload () {
    return new Promise((resolve) => {
      // Preload main image
      const mainImageObject = new Image()
      mainImageObject.crossOrigin = 'anonymous'
      mainImageObject.src = this.data.url
      mainImageObject.onerror = () => console.error('Error loading main image')

      // Preload preview image
      const previewImageObject = new Image()
      previewImageObject.crossOrigin = 'anonymous'
      previewImageObject.src = this.data.thumb
      previewImageObject.onload = () => resolve()
      previewImageObject.onerror = () => console.error('Error loading preview image')
    })
  }

  addToStage (params = {}, ativate = false) {
    return this.preload()
      .then(() => ItemsService.addItem(this, params, ativate))
  }

  getDefaultParams () {
    return Object.assign(
      StageService.getDefaultPositionAndSizes(this),
      {
        draggable: true,
        opacity: 0.65
      }
    )
  }

  activateItem () {
    ItemsService.activateItem(this)
  }

  createTransformer () {
    return ItemsService.createTransformer(this)
  }

  scale (scale, previousSizesAndPosition) {
    return ItemsService.scaleModel(this, scale, previousSizesAndPosition)
  }

  setNodeEvents () {
    ItemsService.setNodeEvents(this)
  }

  setItem (node) {
    this.itemFunction = () => node
  }

  getItem () {
    return this.itemFunction()
  }

  deleteFromStage () {
    return ItemsService.deleteItem(this)
  }

  changeItem (startAttributes, startActualSizesAndPosition) {
    return ItemsService.changeItem(this, startAttributes, startActualSizesAndPosition)
  }

  generateSvgGroup (svgData, width, height) {
    const SvgService = require('../services/svg').default
    return SvgService.generateSvgGroup(svgData, width, height)
  }

  generateSvgData () {
    const SvgService = require('../services/svg').default
    return SvgService.getSvgDataByModel(this, this.data.svgUrl)
  }

  static getAsset (assets, item) {
    return assets.find(asset => asset.id === this.getItemId(item))
  }

  static convertItemsToModels () {
    const entity = EntityService.vuex.state.common.entities.find(entity => entity.name === this.CLASS_NAME)
    const ModelClass = EntityService.getModelClassByClassName(entity.name)
    const items = []
    entity.items.forEach(itemData => items.push(new ModelClass(itemData)))
    return items
  }
}
