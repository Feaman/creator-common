'use strict'

export default class DragAndDrop {
  data = {}
  dropZoneClass = 'drop-zone-border'

  handleDragStart (event) {
    this.data.downX = event.pageX
    this.data.downY = event.pageY
  }

  checkDragStart (event) {
    // Get current coords and do nothing if drag was less then 3 pixels
    var moveX = event.pageX - this.data.downX
    var moveY = event.pageY - this.data.downY

    if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3) {
      return
    }

    if (this.data.model) {
      this.doDrag(event)
    }
  }

  doDrag (event) {
    if (!this.data.$draggingImage) {
      this.handleDraggingImage(event)
      if (!this.data.$draggingImage) {
        this.data.model = {}
        return
      }

      var coords = this.getDraggingImageCoords(this.data.$draggingImage)
      this.data.shiftX = this.data.downX - coords.left
      this.data.shiftY = this.data.downY - coords.top
    }

    // Expand dragging image to resulting sizes or shrink to initial sizes on stage border crossing
    if (event.pageX > this.data.expandY) {
      this.data.$draggingImage.querySelector('img').style.width = this.data.model.getDefaultParams().width + 'px'
      this.data.$draggingImage.querySelector('img').style.height = this.data.model.getDefaultParams().height + 'px'
      this.data.$draggingImage.classList.remove('card')
    } else {
      this.data.$draggingImage.classList.add('card')
      this.data.$draggingImage.querySelector('img').style.width = this.data.$initialImage.offsetWidth + 'px'
      this.data.$draggingImage.querySelector('img').style.height = this.data.$initialImage.offsetHeight + 'px'
    }

    // Move dragging image
    this.data.$draggingImage.style.left = event.pageX - this.data.$draggingImage.offsetWidth / 2 + 'px'
    this.data.$draggingImage.style.top = event.pageY - this.data.$draggingImage.offsetHeight / 2 + 'px'

    this.checkDropZone()
  }

  checkDropZone () {
    if (this.data.dropZoneParams) {
      if (
        event.pageX > this.data.dropZoneParams.x &&
        event.pageX < this.data.dropZoneParams.x + this.data.dropZoneParams.width &&
        event.pageY > this.data.dropZoneParams.y &&
        event.pageY < this.data.dropZoneParams.y + this.data.dropZoneParams.height
      ) {
        this.data.$dropZoneBorder.classList.add('active')
      } else {
        this.data.$dropZoneBorder.classList.remove('active')
      }
    }
  }

  handleDraggingImage (event) {
    // Collect info about initial image to drag
    if (event.target.tagName.toLowerCase() === 'img') {
      this.data.$initialElement = event.target.closest('.draggable')
      this.data.$initialImage = event.target
    } else {
      this.data.$initialElement = event.target
      this.data.$initialImage = event.target.querySelector('img')
    }
    this.data.$initialElement.style.opacity = 0.3

    // Create drop zone visualisation
    if (this.data.dropZoneParams) {
      const $dropZone = document.createElement('div')
      $dropZone.classList.add('drop-zone')
      document.body.appendChild($dropZone)
      this.data.$dropZone = $dropZone

      // Create dropZone border
      const $dropZoneBorder = document.createElement('div')
      const padding = 8
      $dropZoneBorder.classList.add(this.dropZoneClass)
      $dropZoneBorder.style.width = this.data.dropZoneParams.width + padding + 'px'
      $dropZoneBorder.style.height = this.data.dropZoneParams.height + padding + 'px'
      $dropZoneBorder.style.left = this.data.dropZoneParams.x - padding / 2 + 'px'
      $dropZoneBorder.style.top = this.data.dropZoneParams.y - padding / 2 + 'px'
      document.body.appendChild($dropZoneBorder)
      this.data.$dropZoneBorder = $dropZoneBorder
    }

    // Create image container
    const $container = document.createElement('div')
    $container.classList.add('dragging-image')
    $container.classList.add('card')
    document.body.appendChild($container)
    this.data.$draggingImage = $container

    // Create image
    const $image = document.createElement('img')
    const width = event.target.offsetWidth
    const height = event.target.offsetHeight
    $image.src = this.data.model.data.thumb
    $image.style.width = width + 'px'
    $image.style.height = height + 'px'
    $container.appendChild($image)

    if (this.onCreatingDraggingImage) {
      this.onCreatingDraggingImage()
    }
  }

  checkDragFinish (event) {
    if (this.data.$draggingImage) {
      this.finishDrag(event)
    } else {
      this.data = {}
    }
  }

  findDroppable (event) {
    // Hide dragging image to hit the element under it
    this.data.$draggingImage.hidden = true

    // Get the element under the dragging image
    var $element = document.elementFromPoint(event.clientX, event.clientY)

    // Reveal dragging image
    this.data.$draggingImage.hidden = false

    // If cursor is goes behind the window edges
    if ($element === null || !$element.classList.contains(this.dropZoneClass)) {
      return null
    }

    return $element
  }

  getDraggingImageCoords (elem) {
    const box = elem.getBoundingClientRect()

    return {
      top: box.top + pageYOffset,
      left: box.left + pageXOffset
    }
  }

  finishDrag (event) {
    var $dropElement = this.findDroppable(event)

    if (!$dropElement) {
      this.cancelDrag(event)
    } else {
      this.endDrag($dropElement)
    }

    this.data.$initialElement.style.opacity = 1
    this.cleanOut()
  }

  cancelDrag () {
  }

  endDrag ($dropElement) {
    if ($dropElement.classList.contains(this.dropZoneClass)) {
      this.onEnd(this.data.model, event.clientX, event.clientY)
    }
  }

  cleanOut () {
    this.data.$draggingImage.remove()

    if (this.data.dropZoneParams) {
      this.data.$dropZone.remove()
      this.data.$dropZoneBorder.remove()
    }

    this.data = {}
  }
}
