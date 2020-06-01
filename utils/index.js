'use strict'

export default class Utils {
  static getFullDateFromTimestamp (timestamp) {
    const date = new Date(timestamp)

    function addZero (number) {
      return number < 10 ? '0' + number : number
    }

    return addZero(date.getDate()) + '.' + addZero(date.getMonth() + 1) + '.' + date.getFullYear() + ' ' + addZero(date.getHours()) + ':' + addZero(date.getMinutes()) + ':' + addZero(date.getSeconds())
  }

  static getDateFromTimestamp (timestamp) {
    const date = new Date(timestamp)

    function addZero (number) {
      return number < 10 ? '0' + number : number
    }

    return addZero(date.getDate()) + '.' + addZero(date.getMonth() + 1) + '.' + date.getFullYear()
  }

  static setFullHeight ($element) {
    // Calculate list heigth depending on siblings before the list
    let $sibling = $element.parentNode.firstChild
    let heigthOfTopSiblings = 0
    let marginTop
    let marginBottom

    // Loop through each sibling and push to the array
    while ($sibling) {
      if ($sibling.nodeType === 1 && $sibling !== $element) {
        marginTop = parseInt(document.defaultView.getComputedStyle($sibling).marginTop, 10)
        marginBottom = parseInt(document.defaultView.getComputedStyle($sibling).marginBottom, 10)
        heigthOfTopSiblings += $sibling.offsetHeight + marginTop + marginBottom
      }
      $sibling = $sibling === $element ? null : $sibling.nextSibling
    }

    // Handle target element margins
    marginTop = parseInt(document.defaultView.getComputedStyle($element).marginTop, 10)
    marginBottom = parseInt(document.defaultView.getComputedStyle($element).marginBottom, 10)
    heigthOfTopSiblings += marginTop + marginBottom

    $element.style.height = `calc(100% - ${heigthOfTopSiblings}px)`
  }

  static fixMasonry ($columns) {
    const columns = [...$columns]

    // Calculate columns height
    let columnsHeights = []
    columns.forEach(($column, index) => {
      const columnElements = [...columns[index].children]
      columnElements.forEach($element => {
        if (!columnsHeights[index]) {
          columnsHeights[index] = 0
        }
        columnsHeights[index] += $element.offsetHeight + 4
      })
    })

    for (let i = 0; i < 5; i++) {
      columnsHeights.forEach((columnHeight, index) => {
        const currentColumnHeight = columnsHeights[index]
        const previousColumnHeight = columnsHeights[index - 1]
        const nextColumnHeight = columnsHeights[index + 1]
        let $lastElement
        if (nextColumnHeight && currentColumnHeight - nextColumnHeight > 200) {
          $lastElement = columns[index].lastChild
          columns[index + 1].appendChild($lastElement)
          columnsHeights[index] -= $lastElement.offsetHeight + 4
          columnsHeights[index + 1] += $lastElement.offsetHeight + 4
        }
        if (previousColumnHeight && currentColumnHeight - previousColumnHeight > 200) {
          $lastElement = columns[index].lastChild
          columns[index - 1].appendChild($lastElement)
          columnsHeights[index] -= $lastElement.offsetHeight + 4
          columnsHeights[index - 1] += $lastElement.offsetHeight + 4
        }
      })
    }
  }

  static getColumnsQuantity (containerWidth) {
    let columnWidth = 90
    if (containerWidth > 400) {
      columnWidth = 110
    }

    return Math.floor(containerWidth / columnWidth)
  }
}
