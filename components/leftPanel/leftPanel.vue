<template lang="pug">
  .left-panel(:style="styles" :class='{ show, hide: !show }')
    styles.styles-component
    template(v-if="currentCategory.name == searchModelName")
      search(
        placeholder="Search elements..."
      )
      .list-shadow(v-if="isSuggesting")
    template(v-if="currentCategory && currentCategory.name !== textModelName")
      user-upload(v-if="currentCategory.name === uploadModelName")
      list.list-component
    template(v-else)
      fonts
    .resizer(
      v-if="!leftPanelIsFloating"
      @mousedown="startDrag($event)"
      ref="resizer"
    )
      .icon(v-html="$creatorCommonIcons.handler")
</template>

<script>
import { mapState } from 'vuex'
import config from '../../config'
import StageService from '../../services/stage/stage'
import Search from './search'
import List from './list'
import Header from './header'
import Fonts from './fonts'
import BaseService from '../../services/base'
import UserUpload from './userUpload'
import TextModel from '~app/models/text'
import SearchModel from '~app/models/search'
import UploadModel from '~app/models/upload'

export default {
  name: 'LeftPanelContent',
  components: {
    search: Search,
    fonts: Fonts,
    list: List,
    'list-header': Header,
    'user-upload': UserUpload,
    styles: BaseService.createComponent('styles')
  },
  data () {
    return {
      styles: {
        width: config.leftPanel.minWidth + 'px',
        minWidth: config.leftPanel.minWidth + 'px'
      },
      searchModelName: SearchModel.CLASS_NAME,
      textModelName: TextModel.CLASS_NAME,
      uploadModelName: UploadModel.CLASS_NAME
    }
  },
  computed: {
    ...mapState({
      leftPanelIsFloating: state => state.common.leftPanel.floating,
      width: state => state.common.leftPanel.width,
      show: state => state.common.leftPanel.show,
      showBackdrop: state => state.common.showBackdrop,
      currentCategory: state => state.common.currentCategory,
      isSuggesting: state => state.common.search.suggesting,
      showSearch: state => state.common.search.show
    })
  },
  watch: {
    showBackdrop: function () {
      if (!this.showBackdrop && this.leftPanelIsFloating) {
        this.$store.dispatch('common/setLeftPanel', { show: false })
      }
    },
    leftPanelIsFloating: function () {
      this.$store.dispatch('common/setLeftPanel', { show: !this.leftPanelIsFloating })
    },
    show: function () {
      if (this.leftPanelIsFloating && this.show) {
        const fullWidth = `calc(100% - ${BaseService.$categories.offsetWidth}px)`
        this.styles.width = fullWidth
        this.styles.maxWidth = fullWidth
        this.styles.minWidth = '300px'
      }
    },
    width () {
      this.setWidth(this.width)
    }
  },
  mounted () {
    BaseService.$leftPanel = this.$el
    this.$store.dispatch('common/setLeftPanel', { show: !this.leftPanelIsFloating })
    window.addEventListener('resize', this.handleWindowResize)
    this.init()
  },
  destroyed () {
    window.removeEventListener('resize', this.handleWindowResize)
  },
  methods: {
    init () {
      const width = this.$store.state.common.leftPanel.floating
        ? window.innerWidth - BaseService.$categories.offsetWidth
        : config.leftPanel.minWidth
      this.$store.dispatch('common/setLeftPanel', { width })
    },
    setWidth (width) {
      width = width + 'px'
      this.styles.width = width
      this.styles.maxWidth = width
      this.styles.minWidth = width
    },
    startDrag (event) {
      this.startX = event.clientX
      this.startY = event.clientY
      this.startWidth = parseInt(document.defaultView.getComputedStyle(this.$el).width, 10)
      this.startHeight = parseInt(document.defaultView.getComputedStyle(this.$el).height, 10)
      document.documentElement.addEventListener('mousemove', this.doDrag, false)
      document.documentElement.addEventListener('mouseup', this.stopDrag, false)
      this.$el.style.overflow = 'hidden'
    },
    doDrag (event) {
      let width = this.startWidth + event.clientX - this.startX
      if (width <= config.leftPanel.minWidth) {
        width = config.leftPanel.minWidth
      } else if (width >= window.innerWidth - config.artBoardMinWidth) {
        width = window.innerWidth - config.artBoardMinWidth - BaseService.$categories.offsetWidth
      }
      this.$store.dispatch('common/setLeftPanel', { width })
      this.$store.dispatch('common/setArtboard', { width: window.innerWidth - this.$el.offsetWidth - BaseService.$categories.offsetWidth })
      StageService.scale()
    },
    stopDrag (event) {
      document.documentElement.removeEventListener('mousemove', this.doDrag, false)
      document.documentElement.removeEventListener('mouseup', this.stopDrag, false)
      this.$el.style.overflow = 'initial'
      this.$store.dispatch('common/setLeftPanel', { width: this.$el.offsetWidth })
      this.$store.dispatch('common/setArtboard', { width: window.innerWidth - this.$el.offsetWidth - BaseService.$categories.offsetWidth })
    },
    handleWindowResize () {
      const leftPanelIsFloating = window.innerWidth <= config.leftPanel.windowWidthToHide
      this.$store.dispatch('common/setLeftPanel', { floating: leftPanelIsFloating })

      // If left panel was expanded and window width changed - restore default left panel width
      if (!leftPanelIsFloating && this.$el.offsetWidth > config.leftPanel.minWidth) {
        const width = config.leftPanel.minWidth
        this.$store.dispatch('common/setLeftPanel', { width })
        this.setWidth(width)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/css/variables';

.left-panel {
  height: 100%;
  position: absolute;
  top: 0;
  overflow: visible;
  background-color: $panel-background-color;
  border-right: 1px solid rgba(255, 255, 255, 0.05);

  .list-component {
    position: relative;
  }

  &.show {
    transition: 0.1s;

    @media (min-width: 0) {
      left: 44px;
    }
    @media (min-width: 1024px) {
      left: 108px;
    }
  }

  &.hide {
    transition: 0.3s;
    left: -100%;
  }

  .resizer {
    width: 10px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    z-index: 40;
    right: -10px;
    background-color: #292929;
    opacity: 0;
    cursor: col-resize;

    .icon {
      fill: #fff;
    }

    &:hover {
      opacity: 1;
      transition: 0.5s;
    }
  }
}
</style>
