'use strict'

import BaseStage from './base'
import StageService from './stage'
import Konva from 'konva'
import config from 'icons8-creator-common/config'
import CommandManager from 'icons8-creator-common/services/history/commandManager'
import ChangeItemCommand from 'icons8-creator-common/services/history/commands/changeItem'

const nanoid = require('nanoid')

export default class Items extends BaseStage {
  static addItem (model, params = {}, activate = false) {
    const itemsLayer = this.stage.findOne(`.${this.ITEMS_LAYER_NAME}`)

    // Handle mirroring
    params.scaleX = params.horizontalMirror ? -1 : 1
    params.scaleY = params.verticalMirror ? -1 : 1

    params = Object.assign(model.getDefaultParams(), params)
    const group = new Konva.Group(Object.assign(
      {
        name: 'image',
        scaleX: 1,
        scaleY: 1
      },
      params
    ))

    StageService.addToLayer(itemsLayer, group)
    model.setItem(group)
    this.models.push(model)

    // Set group offsets
    group.offset({
      x: params.width / 2,
      y: params.height / 2
    })

    // Handle identificator
    if (!params.id) {
      group.id(nanoid())
    }

    // Add image
    const previewImageObject = new Image()
    previewImageObject.crossOrigin = 'anonymous'
    previewImageObject.src = model.data.thumb
    const image = new Konva.Image({
      name: 'itemImage',
      width: params.width,
      height: params.height,
      image: previewImageObject
    })
    group.add(image)

    StageService.handleDraggingCoordinates(group)
    this.startLoader(group, group.width(), group.height())

    // Handle hight resolution image
    const imageReadyCallback = (imageData) => {
      image.setImage(imageData)
      this.stopLoader(group)
      group.opacity(1)
      itemsLayer.draw()
    }
    const mainImage = new Image()
    mainImage.crossOrigin = 'anonymous'
    mainImage.src = model.data.url
    mainImage.onload = () => imageReadyCallback(mainImage)

    model.setNodeEvents()
    itemsLayer.draw()

    if (activate) {
      model.activateItem()
    }

    return model
  }

  static startLoader (group, width, height) {
  // Calculate loader size
    const loaderSize = 20

    const loaderGroupParams = {
      name: 'loader',
      x: width / 2,
      y: height / 2,
      width: loaderSize,
      height: loaderSize
    }

    const loaderGroup = new Konva.Group(loaderGroupParams)
    group.add(loaderGroup)

    // Background ring
    const ring = new Konva.Ring({
      outerRadius: loaderSize,
      innerRadius: loaderSize - 5,
      fill: 'rgba(255, 255, 255, 0.5)'
    })
    loaderGroup.add(ring)

    // Loader arc
    const loader = new Konva.Arc({
      outerRadius: loaderSize,
      innerRadius: loaderSize - 5,
      angle: 60,
      fill: '#ffffff'
    })
    loaderGroup.add(loader)

    // Animate loader arc
    const angularSpeed = 90
    const animation = new Konva.Animation(
      function (frame) {
        var angleDiff = frame.timeDiff * angularSpeed / 1000
        loader.rotate(angleDiff)
      },
      StageService.getItemsLayer()
    )
    animation.start()
    loaderGroup.animation = animation
  }

  static stopLoader (group) {
    if (group.find('.loader')) {
      const loaderGroup = group.find('.loader')[0]
      if (loaderGroup && loaderGroup.animation) {
        loaderGroup.animation.stop()
        loaderGroup.destroyChildren()
        loaderGroup.destroy()
        StageService.getItemsLayer().draw()
      }
    }
  }

  static activateItem (model) {
    if (model !== this.vuex.state.common.currentModel) {
      this.deactivateCurrentItem()
    }

    this.vuex.dispatch('common/setCurrentModel', model)

    model.createTransformer(model)
  }

  static deactivateCurrentItem () {
    const currentModel = this.vuex.state.common.currentModel
    if (currentModel) {
      const activeItem = currentModel.getItem()
      activeItem.fire('beforeDeactivate', activeItem)

      this.stage.find('Transformer').destroy()
      StageService.getItemsLayer().draw()
      this.vuex.dispatch('common/setCurrentModel', null)
    }
  }

  static createTransformer (model) {
    const node = model.getItem()

    // Delete existent transformers
    this.stage.find('Transformer').destroy()
    const ItemsService = this

    const transformer = new Konva.Transformer({
      node,
      rotateAnchorOffset: 20,
      anchorSize: 15,
      boundBoxFunc: function (oldBoundBox, newBoundBox) {
        return ItemsService.handleTransforming(oldBoundBox, newBoundBox, node)
      },
      enabledAnchors: this.TRANSFORMER_ANCHORS,
      rotationSnaps: [0, 90, 180, 270]
    })
    transformer.on('mousedown', () => {
      node._startAttributes = Object.assign({}, node.getAttrs())
    })

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const rotaterAnchor = transformer.findOne('.rotater')
    rotaterAnchor.off('mouseenter')
    rotaterAnchor.on('mouseenter', () => {
      if (isMac) {
        this.stage.content.style.cursor = `url("data:image/svg+xml,%3Csvg width='18' height='21' viewBox='0 0 18 21' fill='none' xmlns='http://www.w3.org/2000/svg'%3E %3Cg filter='url(%23filter0_d)'%3E %3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M10.4854 10H6L6.0945 10.7553C6.42759 12.0494 7.60354 13.0045 9.00005 13.0045C10.6569 13.0045 12 11.6614 12 10.0045C12 8.34769 10.6569 7.00455 9.00005 7.00455C8.53631 7.00455 8.09764 7.10936 7.70588 7.297L10.4854 10ZM4.80779 4.39834C5.97607 3.52359 7.42807 3.00455 9.00005 3.00455C12.866 3.00455 16 6.13855 16 10.0045C16 13.8705 12.866 17.0045 9.00005 17.0045C4.94537 17.0045 2 13.4275 2 9.92752V1.59L4.80779 4.39834Z' fill='white'/%3E %3C/g%3E %3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M3 8.999L8.071 9L6.17128 7.17646C6.89517 6.4524 7.89531 6.00455 9.00005 6.00455C11.2092 6.00455 13 7.79541 13 10.0045C13 12.2137 11.2092 14.0045 9.00005 14.0045C7.13621 14.0045 5.57011 12.7298 5.12607 11.0045H3.08301C3.55909 13.8423 6.02705 16.0045 9.00005 16.0045C12.3138 16.0045 15 13.3183 15 10.0045C15 6.69084 12.3138 4.00455 9.00005 4.00455C7.34309 4.00455 5.84301 4.6762 4.75721 5.7621L3 4.00455V8.999Z' fill='black'/%3E %3Cdefs%3E %3Cfilter id='filter0_d' x='0' y='0.589996' width='18' height='19.4146' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E %3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E %3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'/%3E %3CfeOffset dy='1'/%3E %3CfeGaussianBlur stdDeviation='1'/%3E %3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0'/%3E %3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow'/%3E %3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow' result='shape'/%3E %3C/filter%3E %3C/defs%3E %3C/svg%3E ") 10 10, crosshair`
      } else {
        this.stage.content.style.cursor = `url("data:image/svg+xml,%3Csvg width='19' height='20' viewBox='0 0 19 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E %3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M2.99281 3.57859L0 0.5858V9H8.41424L5.11549 5.7013C6.27217 4.64366 7.81063 4 9.5 4C13.0899 4 16 6.91015 16 10.5C16 14.0899 13.0899 17 9.5 17C6.67141 17 4.2624 15.1927 3.3696 12.6668L3.13393 12H0.0201807L0.417704 13.2937C1.61061 17.176 5.22424 20 9.5 20C14.7467 20 19 15.7467 19 10.5C19 5.25329 14.7467 1 9.5 1C6.98187 1 4.69204 1.98066 2.99281 3.57859Z' fill='%230E1124'/%3E %3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M9.5 18C13.6422 18 17 14.6421 17 10.5C17 6.35786 13.6422 3 9.5 3C7.17432 3 5.09583 4.05858 3.72015 5.72018L6 8H2.42676H1.3736H1V3L3.01031 5.0103C4.56952 3.16895 6.89825 2 9.5 2C14.1944 2 18 5.80557 18 10.5C18 15.1944 14.1944 19 9.5 19C5.67566 19 2.44116 16.4743 1.3736 13H2.42676C3.45636 15.913 6.23444 18 9.5 18Z' fill='white'/%3E %3C/svg%3E ") 10 10, crosshair`
      }
    })

    StageService.getItemsLayer()
      .add(transformer)
      .draw()

    return transformer
  }

  static handleTransforming (oldBoundBox, newBoundBox, node) {
    if (!newBoundBox.rotation) {
      const actualSizesAndPosition = StageService.getActualSizesAndPosition()
      const width = newBoundBox.width * (node.scaleX() < 0 ? -1 : 1)
      const height = newBoundBox.height * (node.scaleY() < 0 ? -1 : 1)

      // Set minimizing limits
      if (width < config.minimumItemWidth) {
        newBoundBox = oldBoundBox
      }

      // Top side offset
      const x = node.scaleX() < 0 ? newBoundBox.x + newBoundBox.width : newBoundBox.x
      const y = node.scaleY() < 0 ? newBoundBox.y + newBoundBox.height : newBoundBox.y
      if (y > actualSizesAndPosition.y + actualSizesAndPosition.height - config.stage.borderLock) {
        return oldBoundBox
      }

      // Bottom side offset
      if (y + height < actualSizesAndPosition.y + config.stage.borderLock) {
        return oldBoundBox
      }

      // Left side offset
      if (x > actualSizesAndPosition.x + actualSizesAndPosition.width - config.stage.borderLock) {
        return oldBoundBox
      }

      // Right side offset
      if (x + width < actualSizesAndPosition.x + config.stage.borderLock) {
        return oldBoundBox
      }
    }

    return newBoundBox
  }

  static setNodeEvents (model) {
    const item = model.getItem()
    const clickHandler = event => {
      model = this.getModelByItem(item)
      const lastOpaqueNode = this.getLastOpaqueItem(model, event)
      if (lastOpaqueNode) {
        model = this.getModelByItem(lastOpaqueNode)
        model.activateItem()
        lastOpaqueNode.startDrag()
        lastOpaqueNode._startAttributes = Object.assign({}, lastOpaqueNode.getAttrs())
        // console.log(model.getItem(), model.data)
      } else {
        this.deactivateCurrentItem()
      }
    }

    item
      .on('widthChange', (event) => {
        if (item.getName() === 'image') {
          item
            .find(item => item.className === 'Image')
            .forEach(imageNode => {
              imageNode.width(imageNode.width() * event.newVal / event.oldVal)
            })
        }
      })
      .on('heightChange', (event) => {
        if (item.getName() === 'image') {
          item
            .find(item => item.className === 'Image')
            .forEach(imageNode => {
              imageNode.height(imageNode.height() * event.newVal / event.oldVal)
            })
        }
      })
      .on('transformstart', () => {
        this.vuex.dispatch('common/setCurrentModelChanging', true)
      })
      .on('transformend', () => {
        item._endAttributes = Object.assign({}, item.getAttrs())
        this.vuex.dispatch('common/setCurrentModelChanging', false)

        // Add transform command if item has been transformed
        const previousWidth = item._startAttributes.width * item._startAttributes.scaleX
        const previousHeight = item._startAttributes.height * item._startAttributes.scaleY
        const currentWidth = item.width * item.scaleX()
        const currentHeight = item.height * item.scaleY()
        if (
          previousWidth !== currentWidth ||
          previousHeight !== currentHeight ||
          item._startAttributes.rotation !== item._endAttributes.rotation
        ) {
          CommandManager.add(new ChangeItemCommand(this.getModelByItem(item), item._startAttributes, item._endAttributes))
        }
      })
      .on('touchstart', event => {
        clickHandler(event)
      })
      .on('mousedown', event => {
        clickHandler(event)
      })
      .on('dragstart', () => {
        // Hide transformer
        const transformer = this.stage.findOne('Transformer')
        if (transformer) {
          transformer.destroy()
        }

        StageService.createClippingMask()
        this.vuex.dispatch('common/setCurrentModelChanging', true)
      })
      .on('dragmove', () => {
        StageService.handleDraggingCoordinates(item)
      })
      .on('dragend', () => {
        item._endAttributes = Object.assign({}, item.getAttrs())
        StageService.deleteClippingMask()
        StageService.handleDraggingCoordinates(item)
        this.activateItem(model)
        this.vuex.dispatch('common/setCurrentModelChanging', false)

        // Add move command if item has been moved
        if (
          item._startAttributes.x !== item._endAttributes.x ||
          item._startAttributes.y !== item._endAttributes.y
        ) {
          CommandManager.add(new ChangeItemCommand(this.getModelByItem(item), item._startAttributes, item._endAttributes))
        }
      })
  }

  /*
   * Check out if clicked pixel is transparent and if so -
   * activate last opaque item under current if exists
   */
  static getLastOpaqueItem (model, event) {
    const item = model.getItem()
    let resultItem
    if (model.constructor.getConfig().transparent) {
      const pixelData = this.getPixelData(item, event)

      // If transparent point
      if (
        pixelData[0] !== 0 ||
        pixelData[1] !== 0 ||
        pixelData[2] !== 0 ||
        pixelData[3] !== 0
      ) {
        resultItem = item
      }
    } else {
      // Get offsests depending on event type
      let x, y
      if (event.type === 'touchstart') {
        const boundingBox = event.evt.target.getBoundingClientRect()
        x = event.evt.changedTouches[0].pageX - boundingBox.left
        y = event.evt.changedTouches[0].pageY - boundingBox.top
      } else {
        x = event.evt.offsetX
        y = event.evt.offsetY
      }

      // If click was inside the text
      if (
        x > item.x() - item.width() / 2 &&
        (x < item.x() + item.width() / 2) &&
        y > item.y() - item.height() / 2 &&
        (y < item.y() + item.height() / 2)
      ) {
        resultItem = item
      }
    }

    if (!resultItem) {
      // Find the item next besides the current
      const nextModel = this.getNextModel(item)
      return nextModel ? this.getLastOpaqueItem(nextModel, event) : null
    }

    return resultItem
  }

  static getPixelData (node, event) {
    const newLayer = new Konva.Layer()
    const devicePixelRatio = window.devicePixelRatio
    this.stage.add(newLayer)
    newLayer.moveToBottom()
    const nodeClone = node.clone()
    newLayer.add(nodeClone)
    this.stage.draw()

    // Calculate click/touch coordinates
    let x
    let y
    if (event.type === 'touchstart') {
      const boundingBox = event.evt.target.getBoundingClientRect()
      x = event.evt.changedTouches[0].pageX - boundingBox.left
      y = event.evt.changedTouches[0].pageY - boundingBox.top
    } else {
      x = event.evt.offsetX
      y = event.evt.offsetY
    }
    x *= devicePixelRatio
    y *= devicePixelRatio

    const pixelData = newLayer.getContext('2d').getImageData(x, y, 1, 1).data
    newLayer.destroy()

    return pixelData
  }

  static getNextModel (item) {
    const nextItem = StageService.getItemsLayer()
      .findOne(`.${this.CLIPPING_GROUP_NAME}`)
      .getChildren()[item.getZIndex() - 1]

    if (nextItem) {
      return this.getModelByItem(nextItem)
    }
    return null
  }

  static getModelByItem (item) {
    return this.models.find(model => model.getItem().id() === item.id())
  }

  static deleteItem (model) {
    // Delete node
    this.deactivateCurrentItem()
    model.getItem().destroy()
    StageService.getItemsLayer().draw()

    // Delete model
    this.models = this.models.filter(_model => _model.id !== model.id)

    return model
  }

  static changeItem (model, attributes, startActualSizesAndPosition) {
    return new Promise(resolve => {
      model.getItem().setAttrs(attributes)

      // Scale item if stage has been scaled
      const currentActualSizesAndPosition = StageService.getActualSizesAndPosition()
      if (startActualSizesAndPosition.width !== currentActualSizesAndPosition.width) {
        const scale = currentActualSizesAndPosition.width / startActualSizesAndPosition.width
        model.scale(scale, startActualSizesAndPosition)
      }

      StageService.getItemsLayer().draw()
      this.events.$emit('recalculateToolbar')

      resolve()
    })
  }

  static scaleModel (model, scale, previousSizesAndPosition) {
    const item = model.getItem()
    const actualSizesAndPosition = StageService.getActualSizesAndPosition()
    const previousYRatio = (item.y() - previousSizesAndPosition.y) / previousSizesAndPosition.height
    const newWidth = Math.abs(item.width() * scale)
    const newHeight = Math.abs(item.height() * scale)
    item.width(newWidth)
    item.height(newHeight)
    item.offsetX(newWidth / 2)
    item.offsetY(newHeight / 2)
    item.x((item.x() - previousSizesAndPosition.x) * Math.abs(scale) + actualSizesAndPosition.x)
    item.y(actualSizesAndPosition.y + actualSizesAndPosition.height * previousYRatio)
  }

  static recalculateItem (model, previousSizesAndPosition) {
    const actualSizesAndPosition = StageService.getActualSizesAndPosition()
    const item = model.getItem()
    let previousXRatio, previousYRatio
    ({ previousXRatio, previousYRatio } = StageService.getPreviousPositionRatio(item, previousSizesAndPosition))
    item.x(actualSizesAndPosition.x + actualSizesAndPosition.width * previousXRatio)
    item.y(actualSizesAndPosition.y + actualSizesAndPosition.height * previousYRatio)

    // Check if item's right side is outside the left rim somehow
    if (item.x() + item.width() / 2 < actualSizesAndPosition.x + config.stage.borderLock) {
      item.x(actualSizesAndPosition.x + config.stage.borderLock * 2 - item.width() / 2)
    }

    // Check if item's left side is outside the right rim somehow
    if (item.x() - item.width() / 2 > actualSizesAndPosition.x + actualSizesAndPosition.width - config.stage.borderLock) {
      item.x(actualSizesAndPosition.x + actualSizesAndPosition.width - config.stage.borderLock * 2 + item.width() / 2)
    }
  }

  /**
   * Recalculate position and sizes according to actual scale
   */
  static getRecalculatedAttributes (item, scale) {
    const actualSizesAndPosition = StageService.getActualSizesAndPosition()
    const params = {
      width: item.width * scale,
      height: item.height * scale,
      x: (item.x + item.width / 2) * scale + actualSizesAndPosition.x,
      y: (item.y + item.height / 2) * scale + actualSizesAndPosition.y
    }

    return Object.assign({}, item, params)
  }
}
