<template lang="pug">
  .fonts(
    v-if="currentEntity"
    :class="{ new: isNew, current: !isNew }"
  )
    search(
      placeholder="Search fonts..."
      :debounce="false"
    )
    .list-shadow(v-if="isSuggesting")
    .list-container
      .not-found-list-status(
        v-if="isSearch && !items.length"
        key="search-not-found"
      )
        div.icon.big(v-html="$creatorCommonIcons.notFound")
        div Nothing found. Check the spelling
        div or try a more general search term.
      .scroll-container(
        v-app-scroll
        ref="list"
        v-else
      )
        .list
          .item(
            v-for="(font, index) in items"
            :class="{ active: !isNew && font.data.title === currentFontFamily }"
            @click="handleClick(font)"
            ref="item"
          )
            .text(:style="getFontStyle(font)") The quick brown fox jumps over the lazy dog
            .font-name {{ font.data.title }}
</template>

<script>
import { mapState } from 'vuex'
import Search from './search'
import CommandManager from '../../services/history/commandManager'
import AddItemCommand from '../../services/history/commands/addItem'
import ChangeItemCommand from '../../services/history/commands/changeItem'
import TextModelClass from '~app/models/text'
import EntityService from '../../services/entity'
import config from '../../config'
import Utils from '../../utils/index'

export default {
  name: 'Fonts',
  components: {
    search: Search
  },
  data () {
    return {
      currentFontFamily: null,
      textModelName: TextModelClass.CLASS_NAME,
      listBoundingRectangle: {},
      text: null
    }
  },
  computed: {
    ...mapState({
      isSuggesting: state => state.common.search.suggesting,
      items: state => state.common.search.suggesting,
      currentModel: state => state.common.currentModel,
      isSearch: state => state.common.search.isSearch,
      currentCategory: state => state.common.currentCategory,
      currentEntity: state => state.common.entities.find(entity => entity.name === state.common.currentCategory.name)
    }),
    items () {
      if (this.$el) {
        Utils.setFullHeight(this.$el)
      }
      return TextModelClass.convertItemsToModels()
    },
    isNew () {
      return !this.currentModel || this.currentModel.constructor.CLASS_NAME !== TextModelClass.CLASS_NAME
    }
  },
  watch: {
    currentModel (oldValue, newValue) {
      this.setText(oldValue && newValue && oldValue.id !== newValue.id)
    },
    isNew () {
      EntityService.setEntity(this.currentEntity, { title: this.isNew ? 'add text' : 'change font' })
    }
  },
  mounted () {
    Utils.setFullHeight(this.$el)
    this.listBoundingRectangle = this.$refs.list.getBoundingClientRect()
    this.setText()
  },
  methods: {
    hideLeftPanel () {
      this.$store.dispatch('common/setLeftPanel', { show: false })
      this.$store.dispatch('common/showBackdrop', false)
    },
    getFontStyle (font) {
      const fontWeight = font.data.styles.find(style => style.initial).weight
      return `font-family:'${font.data.title}';font-weight:${fontWeight}`
    },
    addText (font) {
      // Clone model from the list because it might be more than one such a model on the stage
      const model = Object.assign(Object.create(Object.getPrototypeOf(font)), font)
      model.id = require('nanoid')()
      CommandManager.execute(new AddItemCommand(model, { fontFamily: model.data.title }))
    },
    changeFontFamily (font) {
      this.currentFontFamily = font.data.title
      let fontStyle = font.data.styles.find(style => style.initial === true).style
      fontStyle = fontStyle === 'regular' ? 'normal' : fontStyle
      CommandManager.execute(new ChangeItemCommand(
        this.currentModel,
        {
          fontFamily: this.currentModel.getItem().fontFamily(),
          fontStyle: this.currentModel.getItem().fontStyle()
        },
        {
          fontFamily: this.currentFontFamily,
          fontStyle
        }
      ))
    },
    handleClick (font) {
      if (window.innerWidth < config.leftPanel.windowWidthToHide) {
        this.hideLeftPanel()
      }
      return this.isNew ? this.addText(font) : this.changeFontFamily(font)
    },
    setText (scrollToFont = true) {
      const activeItem = this.currentModel ? this.currentModel.getItem() : null
      const currentModelIsText = this.currentModel && this.currentModel.constructor.CLASS_NAME === TextModelClass.CLASS_NAME
      this.text = currentModelIsText ? activeItem.text() : config.text.defaultText
      this.currentFontFamily = currentModelIsText ? activeItem.fontFamily() : null

      // Scroll to font
      if (scrollToFont) {
        const itemIndex = this.items.findIndex(item => item.data.title === this.currentFontFamily)
        const scrollContainer = this.$refs.list.querySelector('.simplebar-scroll-content')
        if (itemIndex >= 0) {
          scrollContainer.scrollTop = this.$refs.item[itemIndex].getBoundingClientRect().top - this.listBoundingRectangle.top + scrollContainer.scrollTop
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/css/variables';

.fonts {
  width: 100%;
  height: 100%;
  color: #000;

  .current-list {
    height: 100%;
  }

  .description {
    padding: 15px 10px;
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
  }

  .scroll-container {
    height: 100%;
  }

  .list-container {
    height: calc(100% - 48px);
    margin: -6px 0 0 -2px;
    padding: 0 0 2px 2px;
  }

  .list {
    padding: 22px 16px 8px 0;

    .item {
      padding: 8px 16px 16px 16px;
      background-color: $transparent-white-color;
      border-radius: 8px;
      margin: 0 0 8px 0;
      cursor: pointer;

      .text {
        font-size: 24px;
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding-bottom: 5px;
      }

      .font-name {
        font-size: 14px;
        color: $half-white-color;
      }

      &.active, &:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
  }
}
</style>
