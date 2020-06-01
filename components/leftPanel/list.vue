<template lang="pug">
  .list(
    @mousedown="handleDragStart($event)"
    :class="{ search: currentCategory.name === searchModelName }"
  )
    .preloader-items(
      v-if="isLoading"
    )
      masonry.masonry-container(
        :cols="columnsQuantity"
        gutter="4"
      )
        .animated-background(
          v-for="itemStyles in preloadingItems"
          :style="itemStyles"
        )
    .not-found-list-status(
      v-else-if="isSearch && !items.length"
      key="search-not-found"
    )
      div.icon.big(v-html="$creatorCommonIcons.notFound")
      div Nothing found. Check the spelling
      div or try a more general search term.
    .not-found-list-status(
      v-else-if="isSearchEntity && !items.length"
      key="try-search"
    )
      div.icon.big(v-html="$creatorCommonIcons.searchBig")
      div Enter any word to search all
      div categories in {{ !$store.state.styles.current ? 'all styles' : `the ${$store.state.styles.current.title} style`}}.
    .not-found-list-status(
      v-else-if="!items.length"
      key="style-empty"
    )
      div.icon.big(v-html="$creatorCommonIcons.box")
      div The {{ $store.state.styles.current.title }} style does not contain
      div {{ currentEntity.config.title }}. Try another one.
    .list-container(v-else)
      .scroll-container(
        v-app-scroll
        ref="scrollContainer"
      )
        infinite-scroll(
          parentSelector=".simplebar-scroll-content"
          @infinite="loadMore()"
        )
          masonry.masonry-container(
            :cols="columnsQuantity"
            gutter="4"
            ref="masonry"
          )
            .item.draggable(
              v-for="item in items"
              :key="item.data.id"
              :style="getItemStyle(item.data)"
              @click="handleItem(item)"
              :id="item.data.id"
              draggable="false"
            )
              img(
                :src="item.data.thumb"
                @dragstart="cancelDefaultDrag($event)"
                @drag="cancelDefaultDrag($event)"
                @dragover="cancelDefaultDrag($event)"
                draggable="false"
              )
          .load-button.center(v-show="showLoadButton" v-on:click="loadMore()") Load more

      .loader-container(v-show="isLoadingMore")
        .loader
</template>

<script>
import { mapState } from 'vuex'
import config from '../../config'
import EntityService from '../../services/entity'
import StageService from '../../services/stage/stage'
import Utils from '../../utils/index'
import AddItemCommand from '../../services/history/commands/addItem'
import CommandManager from '../../services/history/commandManager'
import DragAndDrop from '../../services/dragAndDrop'
import SearchModelClass from '~app/models/search'

export default {
  name: 'LeftPanelList',
  data () {
    return {
      preloadingItems: [],
      showLoadButton: false,
      isLoadingMore: false,
      containerWidth: 0,
      lastCheckedWidth: 0,
      recalculteColumnsQuantityInterval: null,
      data: {},
      dragAndDropManager: null,
      searchModelName: SearchModelClass.CLASS_NAME,
      paddings: {
        left: 0,
        right: 0
      }
    }
  },
  computed: {
    ...mapState({
      currentEntity: state => EntityService.getListCurrentEntity(),
      isSearch: state => state.common.search.isSearch,
      currentCategory: state => state.common.currentCategory,
      leftPanelWidth: state => state.common.leftPanel.width,
      leftPanelFloating: state => state.common.leftPanel.floating,
      columnsQuantity: state => state.common.leftPanel.columnsQuantity,
      stage: state => state.common.stage
    }),
    searchQuery () {
      return this.currentEntity.searchQuery
    },
    isLoading () {
      return this.currentEntity.loading
    },
    isSearchEntity () {
      return this.currentEntity.type === SearchModelClass.TYPE
    },
    items () {
      const ModelClass = EntityService.getModelClassByClassName(this.currentEntity.name)
      return ModelClass.convertItemsToModels()
    }
  },
  watch: {
    items () {
      this.handleItemsChange()
    },
    currentEntity () {
      this.setScrollToTop()
      this.calculateColumnsQuantity(true)
      Utils.setFullHeight(this.$el)
    },
    leftPanelWidth () {
      this.calculateColumnsQuantity()
    },
    columnsQuantity () {
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.setScrollToTop()
          this.fixMasonry()
          this.checkHeight()
        })
      })
    }
  },
  mounted () {
    this.calculateColumnsQuantity(true)
    this.generatePreloaderItems()
    this.calculatePaddings()
    Utils.setFullHeight(this.$el)
    this.lastCheckedWidth = this.$el.offsetWidth
    this.initDragAndDropManager()
    document.addEventListener('dragstart', this.cancelDefaultDrag)
    document.addEventListener('mouseup', this.checkDragFinish)
    document.addEventListener('mousemove', this.checkDragStart)

    // Recalculate columns sometimes to prevent missbehavior on window/panels size change
    this.recalculteColumnsQuantityInterval = setInterval(() => this.calculateColumnsQuantity(), 1000)
  },
  destroyed () {
    document.removeEventListener('dragstart', this.cancelDefaultDrag)
    document.removeEventListener('mouseup', this.checkDragFinish)
    document.removeEventListener('mousemove', this.checkDragStart)
    clearInterval(this.recalculteColumnsQuantityInterval)
  },
  methods: {
    cancelDefaultDrag (event) {
      event.dataTransfer.clearData()
      return false
    },
    initDragAndDropManager () {
      this.dragAndDropManager = new DragAndDrop()

      this.dragAndDropManager.onEnd = (item, clientX, clientY) => {
        const params = {
          x: event.clientX - EntityService.$categories.offsetWidth - EntityService.$leftPanel.offsetWidth,
          y: event.clientY - EntityService.$workspace.offsetTop
        }
        CommandManager.execute(new AddItemCommand(item, params, true))
      }
    },
    setScrollToTop () {
      if (this.$refs.scrollContainer) {
        this.$refs.scrollContainer.SimpleBar.getScrollElement().scrollTop = 0
      }
    },
    calculateColumnsQuantity (forse = false) {
      if (forse || this.lastCheckedWidth !== this.$el.offsetWidth) {
        const columnsQuantity = Utils.getColumnsQuantity(this.$el.offsetWidth)
        this.$store.dispatch('common/setLeftPanel', { columnsQuantity })

        this.$nextTick(() => {
          if (this.$refs.masonry) {
            this.$refs.masonry.displayColumns = columnsQuantity
          }
        })

        this.lastCheckedWidth = this.$el.offsetWidth
      }
    },
    generatePreloaderItems () {
      for (let i = 0; i < 50; i++) {
        this.preloadingItems.push({
          height: (Math.floor(Math.random() * 1000) + 650) / 10 + 'px'
        })
      }
    },
    calculatePaddings () {
      this.paddings.left = parseInt(document.defaultView.getComputedStyle(this.$el).paddingLeft, 10)
      this.paddings.right = parseInt(document.defaultView.getComputedStyle(this.$el).paddingRight, 10)
    },
    getItemStyle (itemData) {
      const listWidth = this.lastCheckedWidth
      const ModelClass = EntityService.getModelClassByClassName(this.currentEntity.name)
      const containerWidth = listWidth - this.paddings.left - this.paddings.right
      return {
        height: ModelClass.getListItemHeight(itemData, containerWidth, this.columnsQuantity) + 'px',
        padding: ModelClass.getConfig().listItemPadding + 'px'
      }
    },
    loadMore () {
      this.showLoadButton = false
      if (this.currentEntity.items.length < this.currentEntity.total) {
        this.isLoadingMore = true
        this.loadItems()
          .then(() => {
            this.isLoadingMore = false
            this.$nextTick(() => this.checkHeight())
          })
      }
    },
    loadItems () {
      const ModelClass = EntityService.getModelClassByClassName(this.currentEntity.name)
      return ModelClass.fetchNextPage(this.currentEntity.store)
    },
    handleItem (item) {
      // Clone model from the list because it might be more than one such a model on the stage
      const model = Object.assign(Object.create(Object.getPrototypeOf(item)), item)
      model.id = require('nanoid')()

      CommandManager.execute(new AddItemCommand(model, {}, true))
      if (window.innerWidth < config.leftPanel.windowWidthToHide) {
        this.hideLeftPanel()
      }
    },
    hideLeftPanel () {
      this.$store.dispatch('common/setLeftPanel', { show: false })
      this.$store.dispatch('common/showBackdrop', false)
    },
    fixMasonry () {
      if (this.$refs.masonry) {
        Utils.fixMasonry(this.$refs.masonry.$el.children)
      }
    },
    checkHeight () {
      // Check if there is no scroll (few elements)
      this.showLoadButton = this.$refs.masonry &&
        this.currentEntity.items.length < this.currentEntity.total &&
        this.$refs.masonry.$el.offsetHeight <= this.$refs.scrollContainer.querySelector('.simplebar-scroll-content').offsetHeight
    },
    handleItemsChange () {
      if (this.items.length) {
        Utils.setFullHeight(this.$el)
        this.$nextTick(() => {
          this.$nextTick(() => {
            this.$nextTick(() => {
              this.fixMasonry()
              this.checkHeight()
            })
          })
        })
      }
    },
    handleDragStart (event) {
      const $element = event.target.closest('.draggable')

      if (!this.leftPanelFloating && $element) {
        this.dragAndDropManager.data.expandY = StageService.$categories.offsetWidth + this.leftPanelWidth
        this.dragAndDropManager.data.model = this.items.find(item => item.data.id === $element.id)
        this.dragAndDropManager.handleDragStart(event)
      }
    },
    checkDragStart (event) {
      const actualSizesAndPosition = StageService.getActualSizesAndPosition()
      const dropZoneParams = {
        width: actualSizesAndPosition.width,
        height: actualSizesAndPosition.height,
        x: EntityService.$categories.offsetWidth + EntityService.$leftPanel.offsetWidth + actualSizesAndPosition.x,
        y: EntityService.$workspace.offsetTop + actualSizesAndPosition.y
      }
      this.dragAndDropManager.data.dropZoneParams = dropZoneParams
      this.dragAndDropManager.checkDragStart(event)
    },
    checkDragFinish (event) {
      this.dragAndDropManager.checkDragFinish(event)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/css/variables';
@import '../../assets/css/mixins';
@import '../../assets/css/effects';

.list {
  height: calc(100% - 56px);
  padding: 0;
  margin: 0 0 0 -2px;

  &.search {
    margin: -6px 0 0 -2px;

    .masonry-container {
      padding: 22px 16px 2px 2px;
    }
  }

  .masonry-container {
    width: calc(100% + 4px);
    padding: 16px 16px 2px 2px;
  }

  .preloader-items {
    .animated-background {
      margin-bottom: 4px;
      border-radius: 6px;
    }
  }

  .list-container {
    height: 100%;
    position: relative;

    .scroll-container {
      height: 100%;

      .infinite-scroller {
        padding-bottom: 50px !important;
      }

      .item {
        margin-bottom: 4px;
        background-color: #f8f4ed;
        border-radius: 6px;
        min-width: 50px;
        min-height: 50px;
        cursor: pointer;

        &:hover {
          box-shadow: 0 0 40px rgba(0, 0, 0, 0.6);
          transform: scale(1.04) translate(0.04%, 0.04%);
          transition: all 0.15s;
        }

        img {
          object-fit: contain;
          height: 100%;
          width: 100%;
          display: block;
          border-radius: 6px;
        }
      }
    }
  }

  .load-button {
    width: calc(100% - 16px);
    height: 48px;
    background-color: $transparent-white-color;
    border-radius: 8px;
    margin-top: 16px;
    cursor: pointer;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }

  .loader-container {
    position: absolute;
    display: flex;
    justify-content: center;
    bottom: 0;
    left: 0;
    width: 100%;
    opacity: 0.5;

    .loader {
      height: 56px;
      position: relative;
      @include loading(#fff, 3px, 32px);
    }
  }
}
</style>
