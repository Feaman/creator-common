<template lang="pug">
  .stage-sizes-header(
    v-show="stageRealWidth && stageRealHeight"
    :class="{ short }"
    ref="stageSizes"
  )
    .current-size
      .change-form(v-if="currentSizeIndex === null || stageSizesChanging")
        .inputs
          input(
            v-model="stageWidth"
            @click="showOkButton = true"
            :class="{ error: wrongWidth }"
          )
          .icon.cross(v-html="$creatorCommonIcons.cross")
          input(
            v-model="stageHeight"
            @click="showOkButton = true"
            :class="{ error: wrongHeight }"
          )
        .button(
          v-if="showOkButton"
          @click.stop="saveSizes()"
        ) Set
        .menu-icon.small(
          v-else
          @click="toggle()"
          v-html="$creatorCommonIcons.menuArrowDown"
        )
      .row.center(
        v-else
        @click="toggle()"
      )
        div(v-if="short") Canvas size&nbsp;
        div.row.center.size-info
          div(v-if="short") (
          div {{ sizes[currentSizeIndex].title }}
          div(v-if="sizes[currentSizeIndex].ratio") &nbsp; {{ sizes[currentSizeIndex].ratio }}
          div(v-else) &nbsp;{{ `${sizes[currentSizeIndex].width} x ${sizes[currentSizeIndex].height}` }}
          div(v-if="short") )
        .menu-icon.small(
          v-if="!short"
          v-html="$creatorCommonIcons.menuArrowDown"
        )
</template>

<script>
import { mapState } from 'vuex'
import config from '../../../config'
import CommandManager from '../../../services/history/commandManager'
import ResizeStageCommand from '../../../services/history/commands/resizeStage'

export default {
  name: 'StageSizesHeader',
  props: {
    short: {
      default: false,
      type: Boolean
    }
  },
  data () {
    return {
      initialized: false,
      currentSizeIndex: null,
      sizes: config.stage.sizesPresets,
      showOkButton: false,
      wrongWidth: false,
      wrongHeight: false,
      stageWidth: null,
      stageHeight: null,
      maxWidth: config.stage.sideMaxWidth,
      maxHeight: config.stage.sideMaxWidth,
      minWidth: config.stage.minWidth,
      minHeight: config.stage.minHeight
    }
  },
  computed: {
    ...mapState({
      showStageSizes: state => state.common.stage.showSizes,
      stageRealWidth: state => state.common.stage.realWidth,
      stageRealHeight: state => state.common.stage.realHeight,
      stageSizesChanging: state => state.common.stage.sizesChanging
    })
  },
  watch: {
    stageRealWidth () {
      this.handleStageSizeChange()
    },
    stageRealHeight () {
      this.handleStageSizeChange()
    },
    stageWidth () {
      this.checkSizes()
    },
    stageHeight () {
      this.checkSizes()
    }
  },
  mounted () {
    this.handleStageSizeChange()
  },
  methods: {
    toggle () {
      this.$store.dispatch('common/setStage', { showSizes: !this.showStageSizes })
    },
    changeSize (sizeIndex) {
      this.currentSizeIndex = sizeIndex
    },
    handleStageSizeChange () {
      this.stageWidth = this.stageRealWidth
      this.stageHeight = this.stageRealHeight
      this.findSizeIndex()
    },
    checkSizes () {
      const isStageWidthValid =
          /\d+/.test(this.stageWidth) &&
          this.stageWidth >= this.minWidth &&
          this.stageWidth <= this.maxWidth
      const isStageHeightValid =
          /\d+/.test(this.stageHeight) &&
          this.stageHeight >= this.minHeight &&
          this.stageHeight <= this.maxHeight

      this.wrongWidth = !isStageWidthValid
      this.wrongHeight = !isStageHeightValid

      return isStageWidthValid && isStageHeightValid
    },
    saveSizes () {
      if (this.checkSizes()) {
        this.showOkButton = false
        CommandManager.execute(new ResizeStageCommand(this.stageWidth, this.stageHeight))
          .then(() => {
            this.findSizeIndex()
          })
      }
    },
    findSizeIndex () {
      // Check if sizes set are in the sizes list
      let sizePresetIndex
      this.sizes.forEach((sizePreset, index) => {
        if (sizePreset.width === this.stageRealWidth && sizePreset.height === this.stageRealHeight) {
          sizePresetIndex = index
        }
      })
      this.currentSizeIndex = sizePresetIndex === undefined ? null : sizePresetIndex
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/css/mixins';
@import '../../../assets/css/variables';

.stage-sizes-header {
  height: 100%;
  color: #BDBDBD;
  font-size: 14px;
  position: relative;

  &.short {
    color: #fff;
    font-size: 16px;

    .size-info {
      color: #BDBDBD;
      font-size: 12px;
    }
  }

  .row div {
    white-space: nowrap;
  }

  .current-size {
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    z-index: 10;
    cursor: pointer;

    .change-form {
      display: flex;
      flex-direction: row;
      align-items: center;

      .cross {
        width: 14px;
        margin: 0 2px;
        opacity: 0.5;
        cursor: initial;
      }

      .inputs {
        display: flex;
        flex-direction: row;
        align-items: center;

        input {
          width: 53px;
          height: 32px;
          text-align: center;
          border: none;
          font-size: 14px;
          font-weight: 300;
          background-color: $transparent-white-color;
          color: #fff;
          border-radius: 6px;
          outline: none;
          @include font-regular;

          &.error {
            background-color: #482020;
          }
        }
      }

      .button {
        margin-left: 16px;
      }
    }

    .change-button {
      width: 21px;
      height: 21px;
      padding: 3px;
      fill: #aaa;
      display: none;

      &:hover {
        background-color: #333;
        fill: #fff;
        @include delay()
      }
    }
  }

  .menu-icon {
    margin-left: 8px;
    opacity: 0.5;
    cursor: pointer;
  }
}
</style>
