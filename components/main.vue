<template lang="pug">
  .main.no-select.row
    categories
    left-panel(ref="leftPanel")
    art-board(ref="artBoard")
    right-panel

    .backdrop(
      @click="$store.dispatch('common/showBackdrop', false)"
      :class="{ show: showBackdrop }"
    )
</template>

<script>
import { mapState } from 'vuex'
import ArtBoard from './artBoard/artBoard'
import RightPanel from './rightPanel/rightPanel'
import Categories from './categories'
import LeftPanel from './leftPanel/leftPanel'
import StageService from '../services/stage/stage'
import ItemsService from '../services/stage/items'
import TextModelClass from '../models/text'
import BaseService from '../services/base'

export default {
  name: 'Main',
  components: {
    categories: Categories,
    'art-board': ArtBoard,
    'left-panel': LeftPanel,
    'right-panel': RightPanel
  },
  computed: {
    ...mapState({
      leftPanelIsFloating: state => state.common.leftPanel.floating,
      showRightPanel: state => state.common.showRightPanel,
      showBackdrop: state => state.common.showBackdrop
    })
  },
  mounted () {
    // Initialize stage
    this.$nextTick(() => StageService.init())
    document.addEventListener('mousedown', this.outsideClick)

    // Fix 100vh for mobile
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)

    window.addEventListener('resize', this.handleWindowResize)
  },
  destroyed () {
    document.removeEventListener('mousedown', this.outsideClick)
    window.removeEventListener('resize', this.handleWindowResize)
    this.$store.dispatch('common/clear')
    BaseService.models = []
  },
  methods: {
    isTextThingsClicked (event) {
      let isTextThingsClicked = false
      const currentModel = this.$store.state.common.currentModel
      const isTextElement = currentModel && currentModel.constructor.CLASS_NAME === TextModelClass.CLASS_NAME

      if (isTextElement) {
        const $fonts = document.querySelector('.fonts')
        const isFontsClicked = isTextElement && $fonts && $fonts.contains(event.target)
        const $category = StageService.$categories.querySelector('.active')

        isTextThingsClicked = isFontsClicked || $category.contains(event.target)
      }

      return !isTextElement || !isTextThingsClicked
    },
    handleWindowResize () {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
    },
    outsideClick (event) {
      const $workspace = document.querySelector('.workspace')
      if (!$workspace.contains(event.target) && this.isTextThingsClicked(event)) {
        ItemsService.deactivateCurrentItem()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
  position: relative;
  justify-content: space-between;

  .right-panel, .art-board, .backdrop {
    position: relative;
  }

  .right-panel, .backdrop {
    position: absolute;
  }

  .art-board {
    z-index: 10;
  }

  .right-panel {
    z-index: 60;
  }

  .categories {
    z-index: 30;
  }

  .left-panel {
    z-index: 40;
  }

  .backdrop {
    z-index: 50;
    opacity: 0;
    visibility: hidden;
    transition: 0.3s;

    &.show {
      opacity: 1;
      visibility: visible;
    }
  }
}
</style>
