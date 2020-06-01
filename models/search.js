'use strict'

import BaseModel from './base'
import EntityService from '../services/entity'

export default class Search extends BaseModel {
  static CLASS_NAME = 'search'
  static TYPE = 'search'

  static config = {
    title: 'search',
    searchable: false,
    icon: 'search'
  }

  static getConfig () {
    return Object.assign(BaseModel.getConfig(), this.config)
  }

  static convertItemsToModels () {
    const entity = EntityService.vuex.state.common.entities.find(entity => entity.name === this.CLASS_NAME)
    const items = []
    entity.items.forEach(itemData => {
      const ModelClass = EntityService.getModelClassByType(itemData.categories[0].pretty_id)
      items.push(new ModelClass(itemData))
    })
    return items
  }
}
