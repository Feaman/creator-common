'use strict'

import Konva from 'konva'
import BaseService from './base'
import config from '../config'
import StageService from 'icons8-creator-common/services/stage/stage'
import ItemsService from 'icons8-creator-common/services/stage/items'
import CommandManager from 'icons8-creator-common/services/history/commandManager'
import ChangeItemCommand from 'icons8-creator-common/services/history/commands/changeItem'

const nanoid = require('nanoid')

if (process.browser) {
  require('../static/vue-static/webfont')
}

export default class Text extends BaseService {
  static TEXTAREA_OFFSET = 2

  static loadFonts () {
    const fontsLoaded = []
    const TextModelClass = require('~app/models/text').default
    const entity = this.vuex.state.common.entities.find(entity => entity.name === TextModelClass.CLASS_NAME)
    const service = this

    window.WebFont.load({
      fontactive: (fontTitle) => {
        if (!fontsLoaded.includes(fontTitle)) {
          // Redraw canvas if text with such a font exists because font will be loaded later than text drawn
          this.handleFontRedraw(fontTitle)
          fontsLoaded.push(fontTitle)
        }
      },
      fontinactive: function (fontTitle) {
        console.error('error loading font', fontTitle)

        // Delete missing font from fonts array so user wouldn't use it
        const items = entity.items.filter(textModel => textModel.data.title !== fontTitle)
        service.vuex.dispatch('common/setEntity', { entity, data: { items, total: items.length } })
      },
      google: {
        families: config.text.fonts.map(font => `${font.title}:400,400i,700`)
      }
    })
  }

  static fetchItems (entity) {
    return new Promise(resolve => {
      const searchQuery = entity.searchQuery

      this.filter(searchQuery)
        .then(fonts => {
          const items = []
          fonts.forEach(font => {
            items.push(font)
          })
          this.vuex.dispatch('common/setEntity', { entity, data: { items, total: items.length, loading: false } })
          resolve()
        })
    })
  }

  static handleFontRedraw (fontFamily) {
    if (this.stage) {
      let isToRedraw = false
      this.stage.find(node => {
        if (node.className === 'Text' && node.fontFamily() === fontFamily) {
          isToRedraw = true
        }
      })
      if (isToRedraw) {
        // Prevent text from overflow out of the node's bounds
        this.stage.find(node => {
          if (node.className === 'Text' && node.fontFamily() === fontFamily) {
            const nodeText = node.text()
            node.text(nodeText + '.')
            node.text(nodeText)
          }
        })
        StageService.getItemsLayer().draw()
      }
    }
  }

  static addToStage (model, params = {}, activate = false) {
    const fontSize = this.vuex.state.common.stage.height * 0.1
    const width = this.stage.width()
    const height = fontSize
    const fontFamily = params.fontFamily || config.text.fonts[0].title
    const layer = this.stage.findOne(`.${StageService.ITEMS_LAYER_NAME}`)

    // Handle font style
    let fontStyle = config.text.fonts.find(font => font.title === fontFamily).styles.find(style => style.initial).style
    if (fontStyle === 'regular') {
      fontStyle = 'normal'
    }

    const defaultParams = {
      id: params.id || nanoid(),
      name: 'text',
      width,
      height,
      draggable: true,
      fontSize,
      fontFamily,
      fontStyle,
      lineHeight: 1.8,
      fill: 'black'
    }

    const textNode = new Konva.Text(Object.assign({}, defaultParams, params))
    model.setItem(textNode)

    ItemsService.setNodeEvents(model)

    textNode
      .on('dblclick', () => {
        this.handleTextEditArea(model)
      })
      .on('dbltap', () => {
        this.handleTextEditArea(model)
      })
      .on('beforeDeactivate', () => {
        this.applyText(model)
      })
      .on('fontFamilyChange', () => {
        const newModel = Object.assign(Object.create(Object.getPrototypeOf(model)), model)
        newModel.data = Object.assign({}, newModel.data)
        newModel.data.fontFamily = textNode.fontFamily()
        this.vuex.dispatch('common/setCurrentModel', newModel)
      })

    StageService.addToLayer(layer, textNode)
    textNode.moveToBottom()

    if (!params.id) {
      this.handleText(model)
      textNode.width(textNode.getTextWidth())
      textNode.height(textNode.text().split('\n').length * textNode.getTextHeight() * textNode.lineHeight())
      this.moveToTheEmptyArea(model)
    }

    textNode.offsetX(textNode.width() / 2)
    textNode.offsetY(textNode.height() / 2)

    if (activate) {
      model.activateItem()
    }

    layer.draw()
    StageService.models.push(model)

    return model
  }

  static handleText (model) {
    const textNode = model.getItem()
    let text = textNode.text() ? textNode.text() : config.text.defaultText

    // Split text if needed
    let spacesIndexs = []
    if (text.length > 20) {
    // Find spaces
      [...text].forEach((letter, index) => {
        if (letter === ' ') {
          spacesIndexs.push(index)
        }
      })

      // If spaces exists - split by the right-center one
      if (spacesIndexs.length) {
        let centerSpaceIndexes = []
        switch (spacesIndexs.length) {
          case 1:
            centerSpaceIndexes.push(spacesIndexs[0])
            break
          default:
            if (text.length > 40 && spacesIndexs.length > 1) {
              centerSpaceIndexes.push(spacesIndexs[Math.floor(spacesIndexs.length / 3)])
              centerSpaceIndexes.push(spacesIndexs[Math.floor(spacesIndexs.length / 3 * 2)])
            } else {
              centerSpaceIndexes.push(spacesIndexs[Math.floor(spacesIndexs.length / 2)])
            }
            break
        }
        centerSpaceIndexes.forEach(spaseIndex => {
          text = text.substr(0, spaseIndex) + '\n' + text.substr(spaseIndex + 1)
        })
      }
    }
    textNode.text(text)

    // Set text height according to text lines amount
    this.resizeTextNode(model)
  }

  static resizeTextNode (model, textNodeHeight = null) {
    const textNode = model.getItem()
    const oldY = textNode.y() - textNode.height() / 2
    textNode.height((textNodeHeight || this.getTextareaHeight(textNode)) + (textNode.text().split('\n').length ? 10 : 0))
    textNode.offsetY(textNode.height() / 2)
    textNode.y(oldY + textNode.height() / 2)
    StageService.getItemsLayer().draw()
  }

  /*
   * Create temporary textarea to determine it's height with certain text
   */
  static getTextareaHeight (textNode) {
    const textarea = this.createHiddenTextarea(textNode, 'text-edit-temp')
    const textareaHeight = textarea.scrollHeight
    textarea.remove()

    return textareaHeight
  }

  /*
   * Create temporary textarea to determine it's height with certain text
   */
  static createHiddenTextarea (textNode, className = null) {
    const textarea = document.createElement('textarea')
    this.setTextareaStyles(textarea, textNode, className)
    textarea.style.visibility = 'hidden'
    this.$workspace.appendChild(textarea)

    return textarea
  }

  static setTextareaStyles (textarea, textNode, className = null) {
    textarea.value = textNode.text()
    textarea.className = className || 'text-edit'
    textarea.style.width = textNode.width() + this.TEXTAREA_OFFSET + 'px'
    textarea.style.height = textNode.getTextHeight() * textNode.lineHeight() + 'px'
    textarea.style.fontSize = textNode.getAttrs().fontSize + 'px'
    textarea.style.lineHeight = textNode.lineHeight() * textNode.fontSize() + 'px'
    textarea.style.fontFamily = textNode.fontFamily()
    textarea.style.textAlign = textNode.align()
    textarea.style.color = textNode.getAttrs().fill
    textarea.style.fontWeight = textNode.fontStyle() === 'bold' ? 'bold' : 'normal'
    textarea.style.fontStyle = textNode.fontStyle() === 'italic' ? 'italic' : 'normal'
    textarea.style.overflow = 'hidden'
    textarea.style.margin = 0
    textarea.style.padding = 0
  }

  static moveToTheEmptyArea (textModel) {
    const textNode = textModel.getItem()
    const actualSizesAndPosition = StageService.getActualSizesAndPosition()
    let y = actualSizesAndPosition.y + textNode.height() / 2
    let x = actualSizesAndPosition.x + textNode.width() / 2

    // Find empty space at the top
    let topBorder = actualSizesAndPosition.y
    let bottomBorder = actualSizesAndPosition.y + actualSizesAndPosition.height
    const TextModelClass = require('~app/models/text').default
    StageService.models.forEach(model => {
      const node = model.getItem()
      if (model.constructor.CLASS_NAME === TextModelClass.CLASS_NAME) {
        const nodeTopBorder = node.y() - node.height() / 2
        const nodeBottomBorder = node.y() + node.height() / 2
        if (nodeTopBorder < bottomBorder) {
          topBorder = nodeTopBorder
        }
        if (nodeBottomBorder > topBorder) {
          bottomBorder = nodeBottomBorder
        }
      }
    })

    // If there is an empty space after existing texts
    if (topBorder - actualSizesAndPosition.y < textNode.height() && actualSizesAndPosition.y + actualSizesAndPosition.height - bottomBorder > textNode.height() + 5) {
      y = bottomBorder + textNode.height() / 2 + 5
    }

    textNode.x(x)
    textNode.y(y)
  }

  /*
   * Create textarea over canvas to change the text
   */
  static handleTextEditArea (model) {
    const textNode = model.getItem()
    const textarea = this.createTextEditArea(model)
    textarea.focus()

    this.stage.find('Transformer').opacity(0)
    textNode.opacity(0)
    StageService.getItemsLayer().draw()
  }

  static updateTextareaHeight (model, textarea) {
    const textNode = model.getItem()
    const initialHeight = textNode.getTextHeight() * textNode.lineHeight() + 'px'
    textarea.style.height = initialHeight
    textarea.style.minHeight = initialHeight

    const resultHeight = textarea.scrollHeight + 'px'
    textarea.style.height = resultHeight
    textarea.style.minHeight = resultHeight
  }

  static createTextEditArea (model) {
    const textNode = model.getItem()

    // Create textarea and style it
    let textarea = this.createHiddenTextarea(textNode)
    textarea.style.top = textNode.y() - textNode.height() / 2 - 2 + 'px'
    textarea.style.left = textNode.x() - textNode.width() / 2 - 1 + 'px'
    textarea.style.visibility = 'visible'
    textarea.style.height = textarea.scrollHeight + 'px'
    textarea.addEventListener('input', () => {
      this.applyText(model, false)
      this.updateTextareaHeight(model, textarea)
    })
    textarea.addEventListener('focus', () => {
      this.updateTextareaHeight(model, textarea)
    })

    return textarea
  }

  static applyText (model, removeTextarea = true) {
    const textarea = document.querySelector('.text-edit')

    if (textarea) {
      const textNode = model.getItem()

      // Trim empty rows at the begining and end
      let emptyRowsIndexes = []
      let rows = textarea.value.split('\n')
      rows.forEach((row, index) => {
        if (row === '') {
          emptyRowsIndexes.push(index)
        } else {
          emptyRowsIndexes = []
        }
      })
      let stop = false
      rows.forEach((row, index) => {
        if (!stop) {
          if (row === '') {
            emptyRowsIndexes.push(index)
          } else {
            stop = true
          }
        }
      })
      rows = rows.filter((row, index) => !emptyRowsIndexes.includes(index))
      const resultRows = rows.join('\n')

      if (textNode.text() !== resultRows) {
        CommandManager.execute(new ChangeItemCommand(model, { text: textNode.text() }, { text: resultRows }))
      }

      if (removeTextarea) {
        this.$workspace.removeChild(textarea)
        this.stage.find('Transformer').opacity(1)
        textNode.opacity(1)
        StageService.getItemsLayer().draw()
      }
    }
  }

  static handleTransformer (transformer, model) {
    const textNode = model.getItem()
    transformer
      .on('transformstart', () => {
        textNode._tmp = {}
        textNode._tmp._textarea = this.createHiddenTextarea(textNode, 'text-edit-temp')
      })
      .on('transform', () => {
      // Get new height with respect of new width with help of textarea element
        let textarea = textNode._tmp._textarea
        textarea.style.width = textNode.width() + this.TEXTAREA_OFFSET + 'px'
        this.resizeTextNode(model, textarea.scrollHeight)

        // Set default offset
        textNode.offset({ x: 0, y: 0 })

        textNode.width(textNode.width() * textNode.scaleX())
        textNode.scaleX(1)

        // Restore offset
        textNode.offset({ x: textNode.width() / 2, y: textNode.height() / 2 })
      })
      .on('transformend', () => {
        textNode._tmp._textarea.remove()
        textNode.offset({ x: textNode.width() / 2, y: textNode.height() / 2 })
      })
    transformer.enabledAnchors(['middle-right', 'middle-left'])
    transformer.rotateEnabled(false)
    transformer.keepRatio(false)
    transformer.forceUpdate()
    StageService.getItemsLayer().draw()
  }

  static getLines (textNode) {
    const lines = []

    // Split all text by EOL and parse every line
    textNode.text().split('\n').forEach(realLine => {
      // Create temporary textarea to test scroll height
      const textarea = this.createHiddenTextarea(textNode, 'lines-wrap-parsing')
      textarea.value = ''
      let scrollHeight = textarea.scrollHeight

      // Split line to letters and handle them one by one
      const lineEndings = []
      const letters = [...realLine]
      letters.forEach((letter, index) => {
        textarea.value += letter
        if (textarea.scrollHeight !== scrollHeight) {
          let wrapIndex = index
          // If there is a space - then line will wraps by it
          const lastSpaceIndex = realLine.lastIndexOf(' ')
          if (lastSpaceIndex > 0) {
            wrapIndex = lastSpaceIndex + 1
          }
          lineEndings.push(wrapIndex)
          scrollHeight = textarea.scrollHeight
        }
      })

      textarea.remove()

      // If there are line wraps - split it and store separately
      if (lineEndings) {
        lineEndings.forEach((lineEndIndex, index) => {
          lines.push(realLine.slice(index ? lineEndings[index - 1] : 0, lineEndIndex))
        })
        lines.push(realLine.slice(lineEndings[lineEndings.length - 1]))
      }
    })

    return lines
  }

  static filter (query) {
    return new Promise(resolve => {
      const result = []
      config.text.fonts.forEach(font => {
        if (!query || (query && font.title.toLowerCase().search(query.toLowerCase()) !== -1)) {
          result.push(font)
        }
      })

      resolve(result)
    })
  }
}
