'use strict'

import BaseService from '../base'
import BaseStage from './base'
import BaseModel from '~app/models/base'
import Konva from 'konva'
import config from 'icons8-creator-common/config'
import KeyboardEvents from 'icons8-creator-common/services/keyboardEvents'
import CommandManager from 'icons8-creator-common/services/history/commandManager'
import ChangeItemCommand from 'icons8-creator-common/services/history/commands/changeItem'
import DeleteItemCommand from 'icons8-creator-common/services/history/commands/deleteItem'
import ResizeStageCommand from 'icons8-creator-common/services/history/commands/resizeStage'
import fileSaver from 'file-saver'
import ItemsService from './items'

export default class Stage extends BaseStage {
  static eventsSet = false
  static toolbarTimer = null
  static keyboardArrowsTimer = null
  static keyboardArrowsEventData = null
  static defaultBackground = null

  static init (params = {}, containerId = 'stage') {
    const $workspace = this.$workspace

    // Creating stage
    const stage = new Konva.Stage({
      name: 'stage',
      container: containerId,
      width: $workspace.offsetWidth,
      height: $workspace.offsetHeight
    })
    BaseService.stage = stage
    this.calculateActualSizes(params.width || this.getDefaultStageSizes().width, params.height || this.getDefaultStageSizes().height)

    // Creating default background
    const backgroundColor = params.backgroundColor ? params.backgroundColor : config.defaultBackgroundColor
    BaseModel.initDefaultBackground(backgroundColor)

    // Creating layer for items
    const layer = this.createLayer({
      name: this.ITEMS_LAYER_NAME
    })
    this.stage.add(layer)
    this.stage.draw()

    // Handle outside click
    const outsideClickHandler = () => {
      // Deactivate active item if clicked outside the clipping area
      if (!this.isInsideStageCoordinates()) {
        this.handleOutsideClick()
      }
    }
    stage
      .on('click', () => outsideClickHandler())
      .on('touchstart', () => outsideClickHandler())

    // Handle events
    if (!this.eventsSet) {
      this.handleEvents()
      this.eventsSet = true
    }

    // Scale stage sometimes to prevent missbehavior on window/panels size change
    setInterval(() => this.scale(), 1000)
  }

  /*
   * Create default background
   */
  static initDefaultBackground (fillColor = config.defaultBackgroundColor) {
    const layer = this.createLayer({ name: this.DEFAULT_BACKGROUND_LAYER_NAME })
    this.stage.add(layer)

    // Default background
    const defaultBackground = new Konva.Rect({
      width: this.stage.width(),
      height: this.stage.height()
    })
    defaultBackground.fill(fillColor)
    this.addToLayer(layer, defaultBackground)
    this.defaultBackground = defaultBackground

    // Events
    layer
      .on('tap', () => {
        ItemsService.deactivateCurrentItem()
      })
      .on('mousedown', () => {
        ItemsService.deactivateCurrentItem()
      })

    layer.draw()
  }

  static handleOutsideClick (deactivateDefaultBackground = true) {
    ItemsService.deactivateCurrentItem()
  }

  static isInsideStageCoordinates () {
    const actualSizesAndPosition = this.getActualSizesAndPosition()
    const coordinates = this.stage.getPointerPosition()

    if (
      coordinates &&
    (
      (coordinates.x < actualSizesAndPosition.x) ||
      (coordinates.x > actualSizesAndPosition.x + actualSizesAndPosition.width) ||
      (coordinates.y < actualSizesAndPosition.y) ||
      (coordinates.y > actualSizesAndPosition.y + actualSizesAndPosition.height)
    )
    ) {
      return false
    }

    return true
  }

  static getClippingGroup () {
    const group = new Konva.Group({
      name: this.CLIPPING_GROUP_NAME
    })

    const actualSizesAndPosition = this.getActualSizesAndPosition()
    if (actualSizesAndPosition) {
      group.clip({
        height: Math.ceil(actualSizesAndPosition.height),
        width: Math.ceil(actualSizesAndPosition.width),
        x: Math.ceil(actualSizesAndPosition.x),
        y: Math.ceil(actualSizesAndPosition.y)
      })
    }

    return group
  }

  static calculateActualSizes (initialWidth, initialHeight) {
    const $workspace = this.$workspace
    initialWidth = initialWidth || this.vuex.state.common.stage.width
    initialHeight = initialHeight || this.vuex.state.common.stage.height
    const leftAndRightMargins = config.stage.margin.left * 2
    const topAndBottomMargins = config.stage.margin.left * 2
    const stageIsTooSmall = window.innerWidth < 1000
    const workspaceWidth = $workspace.offsetWidth - (!stageIsTooSmall ? leftAndRightMargins : 0)
    const workspaceHeight = $workspace.offsetHeight - (!stageIsTooSmall ? topAndBottomMargins : 0)
    const isStageLandscape = initialWidth / initialHeight > 1
    const widthRatio = workspaceWidth / initialWidth
    const heightRatio = workspaceHeight / initialHeight
    let width, height

    if (isStageLandscape) {
    // Try scale by width
      width = workspaceWidth
      height = initialHeight * widthRatio
      if (height > workspaceHeight) {
        // Scaling by width is too big, scaling by height
        height = workspaceHeight
        width = initialWidth * heightRatio
      }
    } else {
    // Try scale by height
      height = workspaceHeight
      width = initialWidth * heightRatio
      if (width > workspaceWidth) {
        // Scaling by height is too big, scaling by width
        width = workspaceWidth
        height = initialHeight * widthRatio
      }
    }

    const actualSizesAndPosition = {
      x: ($workspace.offsetWidth - width) / 2,
      y: ($workspace.offsetHeight - height) / 2,
      width,
      height
    }

    this.vuex.dispatch('common/setStage', {
      width,
      height,
      realWidth: initialWidth,
      realHeight: initialHeight,
      actualSizesAndPosition
    })
  }

  /*
   * Adding nodes to the clipping group, not to the layer directly so nodes would clip with others too
   */
  static addToLayer (layer, node) {
    const clippingGroup = layer.findOne(`.${this.CLIPPING_GROUP_NAME}`)
    clippingGroup.add(node)
  }

  static getDefaultStageSizes () {
    return {
      width: config.stage.sizesPresets[config.stage.defaultSizePreset].width,
      height: config.stage.sizesPresets[config.stage.defaultSizePreset].height
    }
  }

  /*
   * Creates new layer with clipping group
   */
  static createLayer (params) {
    const layer = new Konva.Layer(params)
    layer.add(this.getClippingGroup())
    return layer
  }

  static getActualSizesAndPosition () {
    return this.vuex.state.common.stage.actualSizesAndPosition
  }

  /*
   * Calculate default sizes and position at the center of canvas
   */
  static getDefaultPositionAndSizes (model) {
    const actualSizesAndPosition = this.getActualSizesAndPosition()

    // Try to use half of the height size
    let height = actualSizesAndPosition.height * 0.5
    let width = height * (model.data.width / model.data.height)

    // If width more than half of the stage's width - shrink to half of the stage's width
    if (width > actualSizesAndPosition.width / 2) {
      width = actualSizesAndPosition.width / 2
      height = width * (model.data.height / model.data.width)
    }

    let x = actualSizesAndPosition.x + actualSizesAndPosition.width / 2
    let y = actualSizesAndPosition.y + actualSizesAndPosition.height / 2

    return {
      width,
      height,
      x,
      y
    }
  }

  static getItemsLayer () {
    return this.stage.findOne(`.${this.ITEMS_LAYER_NAME}`)
  }

  static handleDraggingCoordinates (node, skipAdhesive = false, skipMoving = false) {
    const actualSizesAndPosition = this.getActualSizesAndPosition()
    const nodeWidth = node.width() * Math.abs(node.scaleX())
    const nodeHeight = node.height() * Math.abs(node.scaleY())

    /* IMAGE ADHESIVE TO THE BORDERS */
    if (!skipAdhesive) {
    // If left corner moving to the left side
      if (
        node.x() - nodeWidth / 2 > actualSizesAndPosition.x - config.stage.borderLock &&
        node.x() - nodeWidth / 2 < actualSizesAndPosition.x + config.stage.borderLock
      ) {
        node.x(actualSizesAndPosition.x + nodeWidth / 2)
      }

      // If right corner moving to the right
      if (
        node.x() + nodeWidth / 2 > actualSizesAndPosition.x + actualSizesAndPosition.width - config.stage.borderLock &&
        node.x() + nodeWidth / 2 < actualSizesAndPosition.x + actualSizesAndPosition.width + config.stage.borderLock
      ) {
        node.x(actualSizesAndPosition.x + actualSizesAndPosition.width - nodeWidth / 2)
      }

      // If upper side moving to the top
      if (
        node.y() - nodeHeight / 2 > actualSizesAndPosition.y - config.stage.borderLock &&
        node.y() - nodeHeight / 2 < actualSizesAndPosition.y + config.stage.borderLock
      ) {
        node.y(actualSizesAndPosition.y + nodeHeight / 2)
      }

      // If bottom side moving to the bottom
      if (
        node.y() + nodeHeight / 2 > actualSizesAndPosition.y + actualSizesAndPosition.height - config.stage.borderLock &&
        node.y() + nodeHeight / 2 < actualSizesAndPosition.y + actualSizesAndPosition.height + config.stage.borderLock
      ) {
        node.y(actualSizesAndPosition.y + actualSizesAndPosition.height - nodeHeight / 2)
      }
    }

    /* PREVENT MOVING OUTSIDE THE STAGE */
    if (!skipMoving) {
    // Prevent moving node outside the stage to the left
      if (node.x() + nodeWidth / 2 < actualSizesAndPosition.x + config.stage.borderLock) {
        node.x(actualSizesAndPosition.x + config.stage.borderLock * 2 - nodeWidth / 2)
      }

      // Prevent moving node outside the stage to the right
      if (node.x() - nodeWidth / 2 > actualSizesAndPosition.x + actualSizesAndPosition.width - config.stage.borderLock) {
        node.x(actualSizesAndPosition.x + actualSizesAndPosition.width - config.stage.borderLock * 2 + nodeWidth / 2)
      }

      // Prevent moving node outside the stage to the top
      if (node.y() + nodeHeight / 2 < actualSizesAndPosition.y + config.stage.borderLock) {
        node.y(actualSizesAndPosition.y + config.stage.borderLock * 2 - nodeHeight / 2)
      }

      // Prevent moving node outside the stage to the bottom
      if (node.y() - nodeHeight / 2 > actualSizesAndPosition.y + actualSizesAndPosition.height - config.stage.borderLock) {
        node.y(actualSizesAndPosition.y + actualSizesAndPosition.height - config.stage.borderLock * 2 + nodeHeight / 2)
      }
    }
  }

  static createClippingMask () {
    const actualSizesAndPosition = this.getActualSizesAndPosition()
    const maskColor = '#1a1a1a'
    const layer = new Konva.Layer({
      name: this.DRAGGING_IMAGE_LAYER_NAME
    })
    const clippingGroup = new Konva.Group({
      width: this.stage.width(),
      height: this.stage.height(),
      opacity: 0.8
    })

    // Top rectangular
    clippingGroup.add(new Konva.Rect({
      fill: maskColor,
      width: this.stage.width(),
      height: actualSizesAndPosition.y
    }))

    // Bottom rectangular
    clippingGroup.add(new Konva.Rect({
      fill: maskColor,
      width: this.stage.width(),
      height: this.stage.height() - actualSizesAndPosition.y - actualSizesAndPosition.height,
      y: actualSizesAndPosition.height + actualSizesAndPosition.y
    }))

    // Left rectangular
    clippingGroup.add(new Konva.Rect({
      fill: maskColor,
      width: actualSizesAndPosition.x,
      height: actualSizesAndPosition.height,
      y: actualSizesAndPosition.y
    }))

    // Right rectangular
    clippingGroup.add(new Konva.Rect({
      fill: maskColor,
      width: this.stage.width() - actualSizesAndPosition.x + actualSizesAndPosition.width,
      height: actualSizesAndPosition.height,
      x: actualSizesAndPosition.x + actualSizesAndPosition.width,
      y: actualSizesAndPosition.y
    }))
    layer.add(clippingGroup)

    this.getItemsLayer()
      .findOne(`.${this.CLIPPING_GROUP_NAME}`)
      .clip({
        x: null,
        y: null,
        width: null,
        height: null
      })

    this.stage.add(layer)
    this.stage.draw()
  }

  static deleteClippingMask () {
    this.getItemsLayer()
      .findOne(`.${this.CLIPPING_GROUP_NAME}`)
      .clip(this.getActualSizesAndPosition())
    this.stage.find(`.${this.DRAGGING_IMAGE_LAYER_NAME}`).destroy()
  }

  static handleEvents () {
    const StageService = this
    const ItemsService = this

    // Handle keypress events
    document.onkeydown = function (event) {
      event = event || window.event
      const currentModel = StageService.vuex.state.common.currentModel
      switch (true) {
        case KeyboardEvents.is(event, KeyboardEvents.ESCAPE):
          if (currentModel && currentModel.getItem()) {
            ItemsService.deactivateCurrentItem()
          } else {
            StageService.stage.find('Transformer').destroy()
            StageService.getItemsLayer().draw()
          }
          break
        case KeyboardEvents.is(event, KeyboardEvents.DELETE):
        case KeyboardEvents.is(event, KeyboardEvents.BACKSPACE):
          if (currentModel && currentModel.getItem()) {
            const activeElementTagName = document.activeElement.tagName
            if (!['INPUT', 'TEXTAREA'].includes(activeElementTagName)) {
              CommandManager.execute(new DeleteItemCommand(currentModel))
            }
          }
          break
        case KeyboardEvents.is(event, KeyboardEvents.ARROW_DOWN):
          StageService.handleArrowsEvents(KeyboardEvents.ARROW_DOWN)
          break
        case KeyboardEvents.is(event, KeyboardEvents.ARROW_UP):
          StageService.handleArrowsEvents(KeyboardEvents.ARROW_UP)
          break
        case KeyboardEvents.is(event, KeyboardEvents.ARROW_LEFT):
          StageService.handleArrowsEvents(KeyboardEvents.ARROW_LEFT)
          break
        case KeyboardEvents.is(event, KeyboardEvents.ARROW_RIGHT):
          StageService.handleArrowsEvents(KeyboardEvents.ARROW_RIGHT)
          break
        case KeyboardEvents.is(event, KeyboardEvents.Z, (event.ctrlKey || event.metaKey) && event.shiftKey):
          if (event.target.tagName.toLowerCase() !== 'input') {
            CommandManager.redo()
            event.preventDefault()
          }
          break
        case KeyboardEvents.is(event, KeyboardEvents.Z, event.ctrlKey || event.metaKey):
          if (event.target.tagName.toLowerCase() !== 'input') {
            CommandManager.undo()
            event.preventDefault()
          }
          break
      }
    }
  }

  static handleArrowsEvents (keyboardEvent) {
    const activeElementTagName = document.activeElement.tagName

    if (this.stage.find('Transformer').length && !['INPUT', 'TEXTAREA'].includes(activeElementTagName)) {
      let transformerNode = this.stage.find('Transformer')[0].getNode()
      this.vuex.dispatch('common/setCurrentModelChanging', true)

      if (!this.keyboardArrowsEventData) {
        this.keyboardArrowsEventData = {
          x: transformerNode.x(),
          y: transformerNode.y()
        }
      }

      switch (true) {
        case keyboardEvent === KeyboardEvents.ARROW_DOWN:
          transformerNode.y(transformerNode.y() + config.itemsMoveStep)
          break
        case keyboardEvent === KeyboardEvents.ARROW_UP:
          transformerNode.y(transformerNode.y() - config.itemsMoveStep)
          break
        case keyboardEvent === KeyboardEvents.ARROW_LEFT:
          transformerNode.x(transformerNode.x() - config.itemsMoveStep)
          break
        case keyboardEvent === KeyboardEvents.ARROW_RIGHT:
          transformerNode.x(transformerNode.x() + config.itemsMoveStep)
          break
      }

      this.handleDraggingCoordinates(transformerNode, true)
      this.getItemsLayer().draw()

      // Handle history change after a while
      clearTimeout(this.keyboardArrowsTimer)
      this.keyboardArrowsTimer = setTimeout(() => {
        const changeItemCommand = new ChangeItemCommand(
          ItemsService.getModelByItem(transformerNode),
          this.keyboardArrowsEventData,
          { x: transformerNode.x(), y: transformerNode.y() }
        )
        CommandManager.execute(changeItemCommand)
        this.keyboardArrowsEventData = null
      }, 500)

      // Handle toolbar apearence
      clearTimeout(this.toolbarTimer)
      this.toolbarTimer = setTimeout(() => {
        this.vuex.dispatch('common/setCurrentModelChanging', false)
      }, 200)
    }
  }

  static scale () {
    const $workspace = this.$workspace
    if ($workspace.offsetWidth !== this.stage.width() || $workspace.offsetHeight !== this.stage.height()) {
      // Handle toolbar apearence
      this.vuex.dispatch('common/setCurrentModelChanging', true)

      // Scale stage
      const previousSizesAndPosition = this.getActualSizesAndPosition()
      this.stage.width($workspace.offsetWidth)
      this.stage.height($workspace.offsetHeight)
      const newScale = this.resize(
        this.vuex.state.common.stage.realWidth,
        this.vuex.state.common.stage.realHeight,
        false,
        true
      )

      // Scale items
      this.models.forEach(model => model.scale(newScale, previousSizesAndPosition))
      this.getItemsLayer().batchDraw()

      // Handle toolbar apearence
      clearTimeout(this.toolbarTimer)
      this.toolbarTimer = setTimeout(() => {
        this.vuex.dispatch('common/setCurrentModelChanging', false)
      }, 200)
    }
  }

  static resize (width, height, isRecalculateItems = true, force = false, changeSizes = false) {
    width = parseInt(width)
    height = parseInt(height)

    this.vuex.dispatch('common/setStage', { sizesChanging: changeSizes })

    // Check if sizes changed
    if (
      !force &&
      this.vuex.state.common.stage.realWidth === width &&
      this.vuex.state.common.stage.realHeight === height
    ) {
      return
    }

    // Get previous sizes
    const previousSizesAndPosition = this.getActualSizesAndPosition()

    // Resize all clipping masks
    const clippingGroups = this.stage.find(`.${this.CLIPPING_GROUP_NAME}`)
    this.calculateActualSizes(width, height)
    const actualSizesAndPosition = this.getActualSizesAndPosition()
    clippingGroups.forEach(clippingGroup => clippingGroup.clip(actualSizesAndPosition))

    // Resize default background
    const defaultBackground = this.getDefaultBackgroud()
    defaultBackground.width(this.stage.width())
    defaultBackground.height(this.stage.height())

    if (isRecalculateItems) {
      this.models.forEach(model => {
        ItemsService.recalculateItem(model, previousSizesAndPosition)
      })
    }

    this.stage.batchDraw()

    return actualSizesAndPosition.width / previousSizesAndPosition.width
  }

  static getPreviousPositionRatio (item, previousSizesAndPosition) {
  // Previous x position ratio
    const previousXRatio = (item.x() - previousSizesAndPosition.x) / previousSizesAndPosition.width

    // Previous y position ratio
    const previousYRatio = (item.y() - previousSizesAndPosition.y) / previousSizesAndPosition.height

    return { previousXRatio, previousYRatio }
  }

  static rotate () {
    const stageData = this.vuex.state.common.stage
    CommandManager.execute(new ResizeStageCommand(stageData.realHeight, stageData.realWidth))
  }

  static getBlob (greaterSideWidth = null, mimeType = 'image/png', quality = null, transparent = false) {
    return new Promise((resolve, reject) => {
      try {
        const actualSizesAndPosition = this.getActualSizesAndPosition()

        // Get scale depends on real stage size or max side width
        let scale
        if (greaterSideWidth) {
          scale = greaterSideWidth / actualSizesAndPosition.width
        } else {
          scale = this.vuex.state.common.stage.realWidth / actualSizesAndPosition.width
        }

        // Create stage duplicate
        const stageClone = this.stage.clone()

        // Crop stage to clipping area
        this.cropToClippingArea(stageClone)

        // Move default background to items layer
        const itemsLayer = stageClone.findOne(`.${this.ITEMS_LAYER_NAME}`)
        if (!transparent) {
          const defaultBackground = this.getDefaultBackgroud().clone()
          itemsLayer.add(defaultBackground)
          defaultBackground.moveToBottom()
        }

        // Add items layer clone to hidden stage
        const hiddenStage = this.createHiddenDulplicate({ width: itemsLayer.width(), height: itemsLayer.height() })
        hiddenStage.add(itemsLayer)

        // Make all images opaque
        this.setLayerItemsOpaque(itemsLayer)

        itemsLayer.draw()

        // If current stage real width is more than current stage width (scale > 1)
        // then scale the blobing stage according to the real width
        if (scale !== 1) {
          this.scaleUp(scale, hiddenStage)
        }

        const callback = blob => {
          hiddenStage.container().remove()
          resolve(blob)
        }
        hiddenStage.container().querySelector('canvas').toBlob(callback, mimeType, quality)
      } catch (error) {
        console.error(error)
        reject(error.message)
      }
    })
  }

  static getDefaultBackgroud () {
    return this.stage.findOne(`.${this.DEFAULT_BACKGROUND_LAYER_NAME}`).findOne('Rect')
  }

  static createHiddenDulplicate (params = {}) {
    // Create DOM element for stage clone
    const $stageDuplicate = document.createElement('div')
    $stageDuplicate.style.display = 'none'
    this.$workspace.appendChild($stageDuplicate)

    // Create stage clone
    params.container = $stageDuplicate
    return new Konva.Stage(params)
  }

  /*
   * Make all images opaque
   */
  static setLayerItemsOpaque (container) {
    container.find(item => {
      if (item.getAttrs().opacity && item.getAttrs().opacity !== 1) {
        item.opacity(1)
      }
    })
    container.find('.loader').destroy()
  }

  static scaleUp (scale, stage) {
    stage = stage || this.stage
    stage.width(stage.width() * scale)
    stage.height(stage.height() * scale)
    stage.scale({ x: scale, y: scale })
    stage.draw()
  }

  static cropToClippingArea (stage) {
  // Crop stage to clipping area
    const actualSizesAndPosition = this.getActualSizesAndPosition()
    const clippingGroups = stage.find(`.${this.CLIPPING_GROUP_NAME}`)
    clippingGroups.forEach(clippingGroup => {
      clippingGroup.clip({ x: undefined, y: undefined, width: undefined, height: undefined })
      clippingGroup.y(clippingGroup.y() - actualSizesAndPosition.y)
      clippingGroup.x(clippingGroup.x() - actualSizesAndPosition.x)
      stage.draw()
    })
    stage.width(actualSizesAndPosition.width)
    stage.height(actualSizesAndPosition.height)
  }

  static download (greaterSideWidth = null, transparent = false) {
    return this.getBlob(greaterSideWidth, 'image/png', null, transparent)
      .then(blob => {
        fileSaver.saveAs(blob, 'download.png')
      })
  }

  static getData (greaterSideWidth = null) {
    const itemsLayer = this.getItemsLayer().clone()
    const scale = this.vuex.state.common.stage.realWidth / this.vuex.state.common.stage.width
    const TextModelClass = require('../../models/text').default

    // Calculate multiplier for result sizes
    let multiplier = 1
    if (greaterSideWidth) {
      const stageParams = this.vuex.state.common.stage
      const currentGreaterSideWidth = stageParams.realWidth > stageParams.realHeight ? stageParams.realWidth : stageParams.realHeight
      multiplier = greaterSideWidth / currentGreaterSideWidth
    }

    // Creage main stage data
    const stageData = {
      stage: {
        width: Math.round(this.vuex.state.common.stage.realWidth * multiplier),
        height: Math.round(this.vuex.state.common.stage.realHeight * multiplier),
        backgroundColor: this.hexToRgba(this.defaultBackground.fill())
      },
      items: []
    }

    const clippingMaskAttributes = itemsLayer.children[0].attrs
    this.models.sort((model1, model2) => {
      return model1.getItem().getZIndex() - model2.getItem().getZIndex()
    })
    this.models.forEach((model, index) => {
      const item = model.getItem()
      let sizesItem = item
      if (item.find) {
        sizesItem = item.findOne('.itemImage') || item
      }
      let itemWidth = item.width() * (item.scaleX() || 1)
      let width = sizesItem.width() * (item.scaleX() || 1)
      let height
      const x = Math.round((item.x() - Math.abs(itemWidth) / 2 - clippingMaskAttributes.clipX) * scale)
      width *= scale

      const itemData = {
        width: Math.round(width < 0 ? Math.abs(width) : width),
        x: x,
        index,
        rotation: item.rotation() ? this.calculateRotationAngle(item.rotation()) : 0,
        type: model.constructor.TYPE
      }

      if (model.constructor.CLASS_NAME === TextModelClass.CLASS_NAME) {
        height = item.getHeight()

        // Generate text properties
        itemData.textProperties = {
          id: model.id,
          align: item.align(),
          fontSize: Math.round(item.fontSize() * scale * 0.88),
          fontStyle: item.fontStyle(),
          text: item.text(),
          fontFamily: item.fontFamily(),
          fill: item.fill()
        }
      } else {
        height = sizesItem.height() * (item.scaleY() || 1)
        itemData.svgData = {
          id: model.data.id
        }
      }

      itemData.width = Math.round(itemData.width * multiplier)
      itemData.height = Math.round((height < 0 ? Math.abs(height) : height) * scale * multiplier)
      itemData.horizontalMirror = item.scaleX() < 0
      itemData.verticalMirror = item.scaleY() < 0
      itemData.x = Math.round(itemData.x * multiplier)
      itemData.y = Math.round((item.y() - Math.abs(height) / 2 - clippingMaskAttributes.clipY) * scale * multiplier)
      stageData.items.push(itemData)
    })

    itemsLayer.destroy()
    return stageData
  }

  static calculateRotationAngle (currentAngle) {
    if (currentAngle < 0) {
      currentAngle = 360 + currentAngle % 360
    }
    return Math.abs(currentAngle % 360)
  }

  static restore (data, assets = [], stageContainerId = 'stage') {
    return new Promise((resolve, reject) => {
      if (!data.stage) {
        return reject('Stage data not found')
      }

      // Destroy current stage if exists
      if (this.stage) {
        this.stage.destroy()
        this.stage = null
      }

      let handleItems = (resolve) => {
        let promises = []
        let models = []
        // Adding models, texts, objects and other stuff to the stage
        if (data.items) {
          const EntityService = require('../entity').default
          const scale = this.vuex.state.common.stage.width / data.stage.width
          data.items.forEach((item, index) => {
            promises.push(new Promise(resolve => {
              const ModelClass = EntityService.getModelClassByType(item.type)
              let model = new ModelClass(Object.assign({}, ModelClass.getAsset(assets, item)))
              models.push(model)
              model.addToStage(model.constructor.getRecalculatedParams(item, scale))
                .then(_model => {
                  model = _model
                  resolve()
                })
            }))
          })
        }

        return Promise.all(promises).then(() => {
          // Set z-index
          models.forEach(model => model.getItem().moveToTop())
          this.getItemsLayer().draw()
          resolve()
        })
      }

      this.init(data.stage, stageContainerId)
      handleItems(resolve)
    })
  }
}
