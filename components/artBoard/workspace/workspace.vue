<template lang="pug">
  .workspace.column(
    :style="styles"
    ref="workspace"
  )
    toolbar
    text-tools
    color-picker
    #stage
</template>

<script>
import Toolbar from './toolbar'
import TextTools from './textTools'
import BaseService from '../../../services/base'
import ColorPicker from '../../colorPicker'

export default {
  name: 'Workspace',
  components: {
    toolbar: Toolbar,
    'text-tools': TextTools,
    'color-picker': ColorPicker
  },
  data () {
    return {
      styles: {
        height: 0
      }
    }
  },
  mounted () {
    BaseService.$workspace = this.$refs.workspace
    window.addEventListener('resize', this.handleWindowResize)
    this.setHeight()
  },
  destroyed () {
    window.removeEventListener('resize', this.handleWindowResize)
  },
  methods: {
    setHeight () {
      this.styles.height = `calc(var(--vh, 1vh) * 100 - ${BaseService.$tools.offsetHeight}px)`
    },
    handleWindowResize () {
      this.setHeight()
    }
  }
}
</script>

<style lang="scss" scoped>
.workspace {
  width: 100%;
  flex: 1;
  position: relative;
  z-index: 10;

  .color-picker {
    z-index: 90;
  }
}
</style>
