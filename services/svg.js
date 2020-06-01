'use strict'

import config from '../config'
import BaseService from 'icons8-creator-common/services/base'
import StageService from 'icons8-creator-common/services/stage/stage'
import axios from 'axios'
import fileSaver from 'file-saver'
import TextService from './text'
import Utils from '../utils'

export default class Svg extends BaseService {
  static async create () {
    // Get all svg
    const sources = await this.api.getCollageSources(this.vuex.state.common.currentCollage)

    const width = this.vuex.state.common.stage.width
    const height = this.vuex.state.common.stage.height

    return new Promise((resolve, reject) => {
      try {
        let svg = null
        const promises = []
        let models = [...StageService.models]
        models = models.sort((a, b) => {
          return a.getItem().getZIndex() - b.getItem().getZIndex()
        })

        models.forEach(model => {
          const source = sources.find(source => source.id === model.data.id)
          model.data.svgUrl = source ? source.svg.url : null
          promises.push(model.generateSvgData())
        })

        Promise.all(promises)
          .then(svgsData => {
            let content = ''
            svgsData.forEach(svgData => {
              content += svgData.model.generateSvgGroup(svgData, width, height)
            })

            svg = `<?xml version="1.0" encoding="iso-8859-1" ?>
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 ${width} ${height}"
                width="${width}"
                height="${height}"
              >
                ${content}
              </svg>`
            const blob = new Blob([svg], { type: 'data:image/svg+xml;charset=utf-8' }, 'file.svg')
            fileSaver.saveAs(blob, 'download.svg')

            resolve(blob)
          })
          .catch(error => {
            reject(error)
          })

        return svg
      } catch (error) {
        reject(error)
      }
    })
  }

  static getSvgDataByModel (model, svgUrl) {
    return new Promise((resolve, reject) => {
      axios.get(svgUrl)
        .then(response => {
          // Find <svg> tag
          const svgString = /<svg.*>.*<\/svg>/i.exec(response.data.replace(/[\n\r\t]/gim, ' '))
          if (!svgString) {
            reject('<svg> tag not found')
          }

          // Find viewBox attribute
          const viewBox = /viewBox="([0-9\.]+)\s+([0-9\.]+)\s+([0-9\.]+)\s+([0-9\.]+)"/i.exec(svgString[0])
          if (!viewBox) {
            reject('"viewBox" attribute not found')
          }

          resolve({
            model,
            width: viewBox[3],
            height: viewBox[4],
            svgContent: svgString[0].replace(/(<svg[^>]*>)|(<\/svg>)/g, '')
          })
        })
        .catch(error => reject(error))
    })
  }

  static getTransformation (svgData, width, height) {
    const stage = this.vuex.state.common.stage
    const actualSizesAndPosition = StageService.getActualSizesAndPosition()
    const item = svgData.model.getItem()
    const itemWidth = item.width() * item.scaleX()
    const itemHeight = item.height() * item.scaleY()

    // Calculate sizes
    const widthScale = Math.round(itemWidth / stage.width * width / svgData.width * 1000) / 1000
    const heightScale = Math.round(itemHeight / stage.height * height / svgData.height * 1000) / 1000

    // Calculate position
    const x = Math.round((item.x() - itemWidth / 2 - actualSizesAndPosition.x) / stage.width * width * 1000) / 1000
    const y = Math.round((item.y() - itemHeight / 2 - actualSizesAndPosition.y) / stage.height * height * 1000) / 1000

    // Calculate rotation
    const scale = width / stage.width
    const rotation = item.rotation()
    const rotationX = Math.round(itemWidth / 2 * scale * 100) / 100
    const rotationY = Math.round(itemHeight / 2 * scale * 100) / 100

    return `translate(${x} ${y}) scale(${widthScale} ${heightScale}) rotate(${rotation} ${1 / widthScale * rotationX} ${1 / heightScale * rotationY})`
  }

  static handleText (model) {
    return new Promise((resolve, reject) => {
      const service = this
      const item = model.getItem()
      const itemWidth = item.width() * item.scaleX()
      const itemHeight = item.height() * item.scaleY()
      const TextToSVG = require('text-to-svg')
      const fontConfigData = config.text.fonts.find(font => font.title === item.fontFamily())
      const fontName = fontConfigData.fontName
      let fontStyle = item.fontStyle()
      if (fontStyle === 'normal') {
        fontStyle = 'regular'
      }
      fontStyle = fontStyle.charAt(0).toUpperCase() + fontStyle.slice(1)
      TextToSVG.load(require(`../static/vue-static/fonts/${fontName}/${fontName}-${fontStyle}.ttf`), function (error, textToSVG) {
        if (error) {
          reject(error)
        } else {
          let paths = []
          const lines = TextService.getLines(item)
          lines.forEach(string => {
            let lineOffsets = service.getTextLineOffsets(item, lines, paths.length + 1)
            paths.push(textToSVG.getPath(
              string,
              {
                fontSize: item.fontSize(),
                x: lineOffsets.x,
                y: lineOffsets.y
              }
            ))
          })
          resolve({
            model,
            width: itemWidth,
            height: itemHeight,
            svgContent: paths.join('.')
          })
        }
      })
    })
  }

  static getTextLineOffsets (item, lines, lineNumber) {
    // Calculate x
    let x = 0
    let textNode = item.clone()
    switch (item.align()) {
      case 'right':
        textNode.text(lines[lineNumber - 1])
        x = (textNode.width() - textNode.getTextWidth())
        break
      case 'center':
        textNode = item.clone()
        textNode.text(lines[lineNumber - 1])
        x = (textNode.width() - textNode.getTextWidth()) / 2
        break
    }

    // Calculate y
    let y = item.getTextHeight()
    if (lineNumber > 1) {
      const lineHeight = item.lineHeight() * item.fontSize()
      y += lineHeight * (lineNumber - 1) + (lineHeight - item.fontSize()) / 2
    }

    return {
      x,
      y
    }
  }

  static generateSvgGroup (svgData, width, height) {
    return `<g transform="${this.getTransformation(svgData, width, height)}">${svgData.svgContent}</g>`
  }
}
