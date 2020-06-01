'use strict'

import BaseService from './base'

export default class Items extends BaseService {
  static ENTITY_STORE_DEFAULT = 'default'
  static ENTITY_STORE_SEARCH = 'search'
  static ENTITY_STORE_RELATED = 'related'
  static ENTITY_STORE_ALTERNATIVE = 'alternative'

  static init (models) {
    // Collect categories and entities data
    const categories = []
    const entities = []
    const SearchModelClass = require('~app/models/search').default

    models.unshift(SearchModelClass)

    // Add other entities
    models.forEach(ModelClass => {
      entities.push({
        name: ModelClass.CLASS_NAME,
        type: ModelClass.TYPE,
        config: ModelClass.getConfig(),
        items: [],
        page: 0,
        total: 0,
        sorting: ModelClass.DEFAULT_SORTING,
        loading: false,
        store: this.ENTITY_STORE_DEFAULT,
        searchQuery: null,
        filters: []
      })
      categories.push({
        name: ModelClass.CLASS_NAME,
        title: ModelClass.getConfig().title,
        icon: ModelClass.getConfig().icon
      })
    })

    // Set categories
    this.vuex.dispatch('common/setCategories', categories)

    // Set current category
    this.vuex.dispatch('common/setCurrentCategory', categories[1])

    // Set entities
    this.vuex.dispatch('common/setEntities', entities)
  }

  static searchSuggest (params) {
    return this.api.searchSuggest(params)
  }

  static async fetchAllItems (params, store = this.ENTITY_STORE_DEFAULT, forceLoading = true) {
    let promises = []
    const SearchModelClass = require('~app/models/search').default

    // Loop through the entities and search them all
    this.getEntitiesByStore(store).forEach(entity => {
      const ModelClass = this.getModelClassByClassName(entity.name)
      const searchQuery = entity.searchQuery
      if (ModelClass.getConfig().fetchable && !(entity.type === SearchModelClass.TYPE && !searchQuery)) {
        this.setEntity(entity, { loading: true })
        promises.push(ModelClass.fetchItems(entity, params, false, forceLoading))
      }
    })

    // Resolve only if all queries has been finished
    await Promise.all(promises)
  }

  static async fetchItems (entity, params = {}, add = false, forceLoading = true) {
    const searchQuery = entity.searchQuery
    const SearchModelClass = require('~app/models/search').default

    if (forceLoading) {
      this.setEntity(entity, { loading: true })
    }

    // Handle page number
    params.page = params.page || 1

    // Handle if search query is set
    if (entity.type === SearchModelClass.TYPE && searchQuery) {
      params.query = searchQuery
    }

    // Fetch them all
    await this.api.getByEntity(entity, Object.assign(this.getSortingAndFiltersByEntity(entity), params))
      .then(data => {
        let items = []

        if (data) {
          data[entity.config.api.field].forEach(assetObject => {
            items.push(assetObject)
          })

          // If new items should be added instead of replace current ones
          if (add) {
            items = [...entity.items, ...items]
          }

          this.setEntity(entity, { loading: false })
          this.setEntity(entity, { items, total: data.total, page: params.page, loading: false })
        }
      })
  }

  static getActionByEntity (entity) {
    let action = null
    switch (entity.store) {
      case this.ENTITY_STORE_DEFAULT:
        action = 'setEntity'
        break
      case this.ENTITY_STORE_RELATED:
        action = 'setRelatedEntity'
        break
      case this.ENTITY_STORE_ALTERNATIVE:
        action = 'setAlternativeEntity'
        break
    }

    return `common/${action}`
  }

  static getEntitiesByStore (store) {
    let entities = []

    switch (store) {
      case this.ENTITY_STORE_DEFAULT:
        entities = this.vuex.state.common.entities
        break
      case this.ENTITY_STORE_RELATED:
        entities = this.vuex.state.common.related.toStage.entities
        break
      case this.ENTITY_STORE_ALTERNATIVE:
        entities = this.vuex.state.common.related.toItem.entities
        break
    }

    return entities
  }

  static getSortingAndFiltersByEntity (entity) {
    const ModelClass = this.getModelClassByClassName(entity.name)
    return Object.assign(
      ModelClass.getSortingParams(this.getEntitiesByStore(entity.store).find(entity_ => entity_.name === entity.name).sorting),
      ModelClass.getFilterParams(this.getEntitiesByStore(entity.store).find(entity_ => entity_.name === entity.name).filters)
    )
  }

  static getModelClassByClassName (className) {
    return require(`~app/models/${className}`).default
  }

  static getModelClassByType (modelType) {
    if (modelType === 'search') {
      return require('../models/search').default
    } else {
      const entity = this.vuex.state.common.entities.find(entity => entity.type === modelType)
      return require(`~app/models/${entity.name}`).default
    }
  }

  static getEntityByNameAndStore (entityName, enitityStore) {
    return this.getEntitiesByStore(enitityStore).find(entity => entity.name === entityName)
  }

  static getListCurrentEntity () {
    return this.vuex.state.common.entities.find(entity => entity.name === this.vuex.state.common.currentCategory.name)
  }

  static async fetchNextPage (entity) {
    const SearchModelClass = require('~app/models/search').default
    const searchQuery = entity.searchQuery

    let params = Object.assign(
      { page: entity.page + 1 },
      this.getSortingAndFiltersByEntity(entity)
    )

    if (entity.type === SearchModelClass.TYPE && searchQuery) {
      params.query = searchQuery
    }

    const ModelClass = this.getModelClassByClassName(entity.name)
    await ModelClass.fetchItems(entity, params, true, false)
  }

  static setEntity (entity, data) {
    this.vuex.dispatch(this.getActionByEntity(entity), { entity, data })
  }
}
