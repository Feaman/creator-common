'use strict'

import BaseService from '../base'

export default class Base extends BaseService {
  static DEFAULT_BACKGROUND_LAYER_NAME = 'default_background_layer'
  static ITEMS_LAYER_NAME = 'items_layer'
  static CLIPPING_GROUP_NAME = 'clipping_group'
  static DRAGGING_IMAGE_LAYER_NAME = 'dragging_image_layer'
  static TRANSFORMER_ANCHORS = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
}
