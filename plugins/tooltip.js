'use strict'

const hide = () => {
  window.document.querySelector('.tooltip').classList.remove('visible')
}

const handlePosition = (sequence, availablePositions, $tooltip) => {
  let positionFound = false
  sequence.forEach(requiredPosition => {
    if (!positionFound) {
      const availablePosition = availablePositions.find(availablePosition => availablePosition.position === requiredPosition)
      if (availablePosition) {
      // Set required position
        $tooltip.style.top = availablePosition.top + 'px'
        $tooltip.style.left = availablePosition.left + 'px'
        positionFound = true
      }
    }
  })
}

const getAvailablePositions = (elementPosition, $tooltip) => {
  let availablePositions = []
  if (elementPosition.top >= 48) {
    availablePositions.push({
      position: 'top',
      top: elementPosition.top - 34,
      left: elementPosition.right - elementPosition.width / 2 - $tooltip.offsetWidth / 2
    })
  }
  if (window.innerHeight - elementPosition.bottom >= 48) {
    availablePositions.push({
      position: 'bottom',
      top: elementPosition.bottom + 16,
      left: elementPosition.right - elementPosition.width / 2 - $tooltip.offsetWidth / 2
    })
  }
  if (elementPosition.left >= $tooltip.offsetWidth + 20) {
    availablePositions.push({
      position: 'left',
      top: elementPosition.bottom - elementPosition.height / 2 - $tooltip.offsetHeight / 2,
      left: elementPosition.left - 16 - $tooltip.offsetWidth
    })
  }
  if (window.innerWidth - elementPosition.right >= $tooltip.offsetWidth + 20) {
    availablePositions.push({
      position: 'right',
      top: elementPosition.bottom - elementPosition.height / 2 - $tooltip.offsetHeight / 2,
      left: elementPosition.right + 16
    })
  }

  return availablePositions
}

const handleTooltip = ($element, value, position) => {
  if (process.browser) {
    // Set events
    $element.onmouseenter = () => {
    // Create or get existent tooltip container
      let $tooltip = window.document.querySelector('.tooltip')
      if (!$tooltip) {
        $tooltip = document.createElement('div')
        $tooltip.classList.add('tooltip')
        window.document.body.appendChild($tooltip)
      }

      // Set tooltip text
      value = value ? value.trim() : ''
      $tooltip.innerHTML = value.charAt(0).toUpperCase() + value.slice(1)

      // Handle tooltip position
      const elementPosition = $element.getBoundingClientRect()
      const availablePositions = getAvailablePositions(elementPosition, $tooltip)
      let sequence

      switch (position) {
        case 'top':
          sequence = ['top', 'bottom', 'right', 'bottom']
          handlePosition(sequence, availablePositions, $tooltip)
          break
        case 'bottom':
          sequence = ['bottom', 'top', 'right', 'bottom']
          handlePosition(sequence, availablePositions, $tooltip)
          break
        case 'left':
          sequence = ['left', 'right', 'top', 'bottom']
          handlePosition(sequence, availablePositions, $tooltip)
          break
        case 'right':
        default:
          sequence = ['right', 'left', 'top', 'bottom']
          handlePosition(sequence, availablePositions, $tooltip)
          break
      }

      // Set tooltip visibility
      $tooltip.classList.add('visible')
      setTimeout(() => hide(), 3000)
    }
    $element.onmouseleave = () => {
      hide()
    }
    $element.onclick = () => {
      hide()
    }
  }
}

export default {
  inserted ($element, { value, arg }) {
    handleTooltip($element, value, arg)
  },
  update ($element, { value, arg }) {
    handleTooltip($element, value, arg)
  }
}
