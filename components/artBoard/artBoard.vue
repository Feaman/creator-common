<template lang="pug">
  .art-board.column(
    :style="styles"
    ref="artBoard"
  )
    tools
    workspace
</template>

<script>
import { mapState } from 'vuex'
import config from '../../config'
import Tools from './tools'
import Workspace from './workspace/workspace'
import Related from './related'
import BaseService from '../../services/base'
import StageService from '../../services/stage/stage'

export default {
  name: 'ArtBoard',
  components: {
    tools: Tools,
    workspace: Workspace,
    related: Related
  },
  data () {
    let width = this.$store.state.common.artboard.width
    width = width ? width + 'px' : 'auto'
    return {
      styles: {
        width,
        minWidth: width,
        maxWidth: width
      }
    }
  },
  computed: {
    ...mapState({
      leftPanelIsFloating: state => state.common.leftPanel.floating,
      artboardWidth: state => state.common.artboard.width
    })
  },
  watch: {
    artboardWidth: function () {
      this.setSizes(this.artboardWidth + 'px')
    }
  },
  mounted () {
    BaseService.$artBoard = this.$refs.artBoard
    const leftPanelWidth = this.leftPanelIsFloating ? 0 : BaseService.$leftPanel.offsetWidth
    this.$store.dispatch('common/setArtboard', { width: window.innerWidth - leftPanelWidth - BaseService.$categories.offsetWidth })
    window.addEventListener('resize', this.handleWindowResize)
  },
  destroyed () {
    window.removeEventListener('resize', this.handleWindowResize)
  },
  methods: {
    setSizes (width) {
      this.styles.width = width
      this.styles.minWidth = width
      this.styles.maxWidth = width
    },
    handleWindowResize () {
      const leftPanelWidth = window.innerWidth <= config.leftPanel.windowWidthToHide ? 0 : config.leftPanel.minWidth
      this.$store.dispatch('common/setArtboard', { width: window.innerWidth - leftPanelWidth - StageService.$categories.offsetWidth })
      StageService.scale()
    }
  }
}
</script>

<style lang="scss" scoped>
.art-board {
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
  flex: 1;
  overflow: hidden;

  .tools {
    z-index: 20;
  }
}
</style>
