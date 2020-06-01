<template lang="pug">
  .text-tools(
    v-show="show"
    :class="{ small: isSmall }"
    :style="styles"
  )
    .actions

      .action.first.color-picker(
        v-tooltip:top="'Change color'"
        @click="handleColorPicker()"
        ref="colorPickerButton"
      )
        img.colorpicker-icon(:src="require('../../../static/vue-static/colorpicker.png')")

      .action(
        v-if="showBoldButton"
        @click="textBold" :class="{ active: bold }"
        v-tooltip:top="'Bold'"
      )
        .icon.bold(v-html="$creatorCommonIcons['text/bold']")

      .action(
        v-if="showItalicButton"
        @click="textItalic" :class="{ active: italic }"
        v-tooltip:top="'Italic'"
      )
        .icon.italic(v-html="$creatorCommonIcons['text/italic']")

      .action(
        @click="textLeft" :class="{ active: left }"
        v-tooltip:top="'Left'"
      )
        .icon.align(v-html="$creatorCommonIcons['text/left']")

      .action(
        @click="textCenter" :class="{ active: center }"
        v-tooltip:top="'Center'"
      )
        .icon.align(v-html="$creatorCommonIcons['text/center']")

      .action(
        @click="textRight" :class="{ active: right }"
        v-tooltip:top="'Right'"
      )
        .icon.align(v-html="$creatorCommonIcons['text/right']")

      .action(
        v-tooltip:top="'Smaller'"
        @click="textSmaller"
      )
        .icon.size(v-html="$creatorCommonIcons['text/smaller']")

      .action.last(
        v-tooltip:top="'Bigger'"
        @click="textBigger"
      )
        .icon.size(v-html="$creatorCommonIcons['text/bigger']")
</template>

<script>
import { mapState } from 'vuex'
import config from '../../../config'
import TextToolsService from '../../../services/textTools'
import TextModel from '../../../models/text'
import ChangeItemCommand from '../../../services/history/commands/changeItem'
import CommandManager from '../../../services/history/commandManager'

export default {
  name: 'TextTools',
  props: {
    isSmall: {
      default: false,
      type: Boolean
    }
  },
  data () {
    return {
      styles: {},
      show: false,
      bold: false,
      showBoldButton: true,
      italic: false,
      showItalicButton: true,
      left: false,
      right: false,
      center: false,
      colorPickerStyle: {}
    }
  },
  computed: {
    ...mapState({
      currentModel: state => state.common.currentModel,
      currentModelFontFamily: state => state.common.currentModel ? state.common.currentModel.data.fontFamily : null,
      currentModelChanging: state => state.common.currentModelChanging,
      loadedFonts: state => state.editor.loadedFonts
    })
  },
  watch: {
    currentModel () {
      if (this.isCurrentModelText() && !this.currentModelChanging) {
        this.calculate()
        this.checkButtons()
      } else {
        this.show = false
        this.$store.dispatch('common/setColorPickerColor', false)
      }
    },
    currentModelChanging () {
      if (this.currentModelChanging) {
        this.show = false
      } else if (this.currentModel && this.isCurrentModelText()) {
        this.calculate()
      }
    },
    currentModelFontFamily () {
      this.checkButtons()
    }
  },
  mounted () {
    this.$root.$on('colorPicked', color => {
      this.changeColor(color)
    })
    document.addEventListener('mousedown', this.outsideClick)
  },
  destroyed () {
    document.removeEventListener('mousedown', this.outsideClick)
  },
  methods: {
    checkButtons () {
      if (this.isCurrentModelText()) {
        const configFont = config.text.fonts.find(font => font.title === this.currentModel.getItem().fontFamily())
        this.showBoldButton = configFont.styles.find(styleData => styleData.style === 'bold')
        this.showItalicButton = configFont.styles.find(styleData => styleData.style === 'italic')
      }
    },
    calculate () {
      const activeItem = this.currentModel.getItem()
      this.bold = activeItem.fontStyle() === 'bold'
      this.italic = activeItem.fontStyle() === 'italic'
      this.right = activeItem.align() === 'right'
      this.left = activeItem.align() === 'left'
      this.center = activeItem.align() === 'center'
      this.fontFamily = activeItem.fontFamily()
      this.styles = TextToolsService.calculatePosition()
      this.show = true
    },
    handleColorPicker () {
      const activeItem = this.currentModel.getItem()
      const color = this.$store.state.common.colorPickerColor
      this.$store.dispatch('common/setColorPickerColor', color ? false : activeItem.fill())
    },
    isCurrentModelText () {
      return this.$store.state.common.currentModel && this.$store.state.common.currentModel.constructor.CLASS_NAME === TextModel.CLASS_NAME
    },
    changeColor (color) {
      const currentItem = this.currentModel.getItem()
      CommandManager.execute(new ChangeItemCommand(this.currentModel, { fill: currentItem.fill() }, { fill: color }))
    },
    textBigger () {
      const currentItem = this.currentModel.getItem()
      CommandManager.execute(new ChangeItemCommand(this.currentModel, { fontSize: currentItem.fontSize() }, { fontSize: currentItem.fontSize() + config.text.resizeStep }))
    },
    textSmaller () {
      const currentItem = this.currentModel.getItem()
      CommandManager.execute(new ChangeItemCommand(this.currentModel, { fontSize: currentItem.fontSize() }, { fontSize: currentItem.fontSize() - config.text.resizeStep }))
    },
    textLeft () {
      const currentItem = this.currentModel.getItem()
      CommandManager.execute(new ChangeItemCommand(this.currentModel, { align: currentItem.align() }, { align: 'left' }))
      this.left = true
      this.center = false
      this.right = false
    },
    textCenter () {
      const currentItem = this.currentModel.getItem()
      CommandManager.execute(new ChangeItemCommand(this.currentModel, { align: currentItem.align() }, { align: 'center' }))
      this.center = true
      this.left = false
      this.right = false
    },
    textRight () {
      const currentItem = this.currentModel.getItem()
      CommandManager.execute(new ChangeItemCommand(this.currentModel, { align: currentItem.align() }, { align: 'right' }))
      this.right = true
      this.center = false
      this.left = false
    },
    textBold () {
      const currentItem = this.currentModel.getItem()
      if (currentItem.fontStyle() === 'bold') {
        CommandManager.execute(new ChangeItemCommand(this.currentModel, { fontStyle: currentItem.align() }, { fontStyle: 'normal' }))
        this.bold = false
      } else {
        CommandManager.execute(new ChangeItemCommand(this.currentModel, { fontStyle: currentItem.align() }, { fontStyle: 'bold' }))
        this.bold = true
        this.italic = false
      }
    },
    textItalic () {
      const currentItem = this.currentModel.getItem()
      if (currentItem.fontStyle() === 'italic') {
        CommandManager.execute(new ChangeItemCommand(this.currentModel, { fontStyle: currentItem.align() }, { fontStyle: 'normal' }))
        this.italic = false
      } else {
        CommandManager.execute(new ChangeItemCommand(this.currentModel, { fontStyle: currentItem.align() }, { fontStyle: 'italic' }))
        this.italic = true
        this.bold = false
      }
    },
    outsideClick (event) {
      if (this.$el.contains(event.target) && !this.$refs.colorPickerButton.contains(event.target)) {
        this.$store.dispatch('common/setColorPickerColor', false)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/css/mixins';
@import '../../../assets/css/variables';

.text-tools {
  height: 43px;
  position: absolute;
  top: -11px;
  z-index: 40;

  .actions {
    height: 100%;
    position: relative;
    z-index: 20;
    display: flex;
    flex-direction: row;
    align-items: center;

    .action {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      background-color: $toolbar-background-color;
      padding: 0 16px;
      height: 100%;
      cursor: pointer;

      .colorpicker-icon {
        width: 20px;
        height: 20px;
      }

      &.first {
        border-radius: 100px 0 0 100px;
        overflow: hidden;
      }

      &.last {
        border-radius: 0 100px 100px 0;
        overflow: hidden;
      }

      &.color-picker {
        padding: 0 11px;
      }

      .icon {
        height: 24px;
        width: 24px;
        fill: #fff;
      }

      &:hover {
        background-color: $toolbar-background-color-hover;
        @include delay()
      }

      &.active {
        background-color: #fff;

        .icon {
          fill: #000;
        }
      }
    }
  }

  &.small {
    height: 36px;

    .action {
      padding: 0 10px;
    }
  }
}
</style>
