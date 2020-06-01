<template lang="pug">
  .stage-sizes-panel
    .size(
      v-for="(size, index) in sizes"
      @click="select(index)"
      :class="getSizeRowClass(size, index)"
    )
      .row
        .title {{ size.title }}
        div
          .ratio(v-if="size.ratio") &nbsp; {{ size.ratio }}
          .title-sizes(v-else) {{ `${size.width} x ${size.height}` }}
</template>

<script>
import { mapState } from 'vuex'
import config from '../../../config'
import StageService from '../../../services/stage/stage'
import ResizeStageCommand from '../../../services/history/commands/resizeStage'
import CommandManager from '../../../services/history/commandManager'

export default {
  name: 'StageSizesPanel',
  data () {
    let sizes = [...config.stage.sizesPresets]

    // Add custom size item
    sizes.push({
      title: 'Custom size',
      width: StageService.getDefaultStageSizes().width,
      height: StageService.getDefaultStageSizes().height
    })

    return {
      currentSizeIndex: null,
      sizes
    }
  },
  computed: {
    ...mapState({
      stageRealWidth: state => state.common.stage.realWidth,
      stageRealHeight: state => state.common.stage.realHeight
    })
  },
  watch: {
    stageRealWidth () {
      this.setSizeIndex()
    },
    stageRealHeight () {
      this.setSizeIndex()
    }
  },
  mounted () {
    this.setSizeIndex()
  },
  methods: {
    setSizeIndex () {
      let sizePresetIndex
      this.sizes.forEach((sizePreset, index) => {
        if (index !== this.sizes.length - 1 && sizePreset.width === this.stageRealWidth && sizePreset.height === this.stageRealHeight) {
          sizePresetIndex = index
        }
      })

      // Set custom size data
      this.sizes[this.sizes.length - 1].width = sizePresetIndex !== undefined ? StageService.getDefaultStageSizes().width : this.stageRealWidth
      this.sizes[this.sizes.length - 1].height = sizePresetIndex !== undefined ? StageService.getDefaultStageSizes().height : this.stageRealHeight

      // Set current size
      if (sizePresetIndex === undefined) {
        sizePresetIndex = this.sizes.length - 1
      }
      this.currentSizeIndex = sizePresetIndex
    },
    select (sizeIndex) {
      this.currentSizeIndex = sizeIndex
      const size = this.sizes[this.currentSizeIndex]
      this.$store.dispatch('common/setStage', { showSizes: false })
      const isCustomSize = sizeIndex === this.sizes.length - 1
      CommandManager.execute(new ResizeStageCommand(size.width, size.height, isCustomSize))
    },
    getSizeRowClass (size, index) {
      return {
        active: index === this.currentSizeIndex,
        custom: index === this.sizes.length - 1,
        last: this.sizes[index + 1] && size.category !== this.sizes[index + 1].category
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../../assets/css/mixins';
  @import '../../../assets/css/variables';

  .stage-sizes-panel {
    width: 100%;
    max-height: calc(100vh - 44px);
    max-height: calc(var(--vh, 1vh) * 100 - 44px);
    background-color: #242424;
    padding: 8px 0;
    font-size: 14px;
    color: #fff;
    overflow: auto;

    .size {
      position: relative;
      cursor: pointer;

      &.active {
        background-color: $transparent-white-color;
      }

      &.last {
        margin-bottom: 20px;

        &::after {
          content: '';
          position: absolute;
          top: 40px;
          border-top: 1px solid $transparent-white-color;
          width: 100%;
          height: 1px;
        }
      }

      .row {
        padding: 4px 16px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;

        .title {
          color: #fff;
        }

        .ratio {
          text-align: right;
        }

        .title-sizes {
          color: $half-white-color;
          text-align: right;
        }

        &:hover {
          background-color: $transparent-white-color;
          @include delay(0.2s)
        }
      }

      &.custom {
        .row {
          padding: 2px 16px;
        }

        .title-sizes {
          background-color: #1a1a1a;
          padding: 2px 10px;
          border-radius: 3px;
        }
      }
    }
  }
</style>
