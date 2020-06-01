<template lang="pug">
  .editor-toolbar(
    v-show="show"
    :style="styles"
  )
      .group(v-if="showFlipButtons")
        .action.up.flip.flip-horizontal(
          v-tooltip="'Flip horizontally'"
          v-on:click="flipHorizontally"
        )
          .icon(v-html="$creatorCommonIcons.flipHorizontally")
        .action.down.flip.flip-vertical(
          v-tooltip="'Flip vertically'"
          v-on:click="flipVertically"
        )
          .icon(v-html="$creatorCommonIcons.flipVertically")

      .group(v-if="showLayerButtons")
        .action.up(
          v-tooltip="'Move layer up'"
          v-on:click="moveUp"
        )
          .icon(v-html="$creatorCommonIcons.up")

        .action.down(
          v-tooltip="'Move layer down'"
          v-on:click="moveDown"
        )
          .icon(v-html="$creatorCommonIcons.down")

      .action.delete(
        v-tooltip="'Delete layer'"
        v-on:click="remove()"
      )
        .icon(v-html="$creatorCommonIcons.bin")

</template>

<script>
import { mapState } from 'vuex'
import ToolbarService from '../../../services/toolbar'
import CommandManager from '../../../services/history/commandManager'
import DeleteItemCommand from '../../../services/history/commands/deleteItem'
import ChangeItemCommand from '../../../services/history/commands/changeItem'

export default {
  name: 'Toolbar',
  data () {
    return {
      show: false,
      showLayerButtons: false,
      styles: {
        height: 0,
        top: 0,
        left: 0
      }
    }
  },
  computed: {
    ...mapState({
      currentModel: state => state.common.currentModel,
      currentModelChanging: state => state.common.currentModelChanging,
      showFlipButtons: state => state.common.currentModel ? state.common.currentModel.constructor.getConfig().flippable : false
    })
  },
  watch: {
    currentModel () {
      if (this.currentModel && !this.currentModelChanging) {
        this.calculate()
      } else {
        this.show = false
      }
    },
    currentModelChanging () {
      if (this.currentModelChanging) {
        this.show = false
      } else if (this.currentModel) {
        this.calculate()
      }
    }
  },
  mounted () {
    ToolbarService.events.$on('recalculateToolbar', this.calculate)
  },
  methods: {
    remove () {
      CommandManager.execute(new DeleteItemCommand(this.currentModel))
    },
    moveUp () {
      const activeItem = this.currentModel.getItem()
      if (activeItem.getZIndex() < activeItem.parent.children.length - 1) {
        CommandManager.execute(new ChangeItemCommand(this.currentModel, { zIndex: activeItem.getZIndex() }, { zIndex: activeItem.getZIndex() + 1 }))
      }
    },
    moveDown () {
      const activeItem = this.currentModel.getItem()
      if (activeItem.getZIndex() > 0) {
        CommandManager.execute(new ChangeItemCommand(this.currentModel, { zIndex: activeItem.getZIndex() }, { zIndex: activeItem.getZIndex() - 1 }))
      }
    },
    flipHorizontally () {
      const activeItem = this.currentModel.getItem()
      CommandManager.execute(new ChangeItemCommand(this.currentModel, { scaleX: activeItem.scaleX() }, { scaleX: activeItem.scaleX() * -1 }))
    },
    flipVertically () {
      const activeItem = this.currentModel.getItem()
      CommandManager.execute(new ChangeItemCommand(this.currentModel, { scaleY: activeItem.scaleY() }, { scaleY: activeItem.scaleY() * -1 }))
    },
    calculate () {
      if (this.currentModel) {
        this.styles = ToolbarService.calculatePositionAndSizes()
        this.showLayerButtons = ToolbarService.getLayerableModelsCount() > 1
        this.show = true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/css/mixins";
@import "../../../assets/css/variables";

.editor-toolbar {
  width: 36px;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 20;

  .group {
    display: flex;
    flex-direction: column;
  }

  .action {
    width: 36px;
    height: 36px;
    background-color: $toolbar-background-color;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 36px;
    cursor: pointer;

    &.up:hover,
    &.down:hover {
      background-color: #6b6b6b;
      @include delay();
    }

    &.up {
      border-radius: 36px 36px 0 0;
    }

    &.down {
      border-radius: 0 0 36px 36px;
      margin-top: 2px;
    }

    &.delete {
      background-color: #ff5659;

      &:hover {
        background-color: red;
        @include delay();
      }
    }

    .icon {
      fill: #fff;
    }
  }
}
</style>
