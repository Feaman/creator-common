<template lang="pug">
  .color-picker(:class="{ show: initColor, hide: !initColor}")
    .swatch(v-if="isSwatch")
      picker(v-model="calculatedColor")
      .input-container.row
        .current-color(:style="{ 'background-color': color }")
        input(v-model="color" tabindex="-1")
    .colors(v-else)
      .color(
        v-for="hex in colors"
        v-bind:style="{ 'background-color': hex }"
        v-on:click="color = hex"
        v-bind:title="hex"
      )
    .footer.center
      .color-hex {{ color }}
      .spacer
      .icon.center(
        v-if="!isSwatch"
        v-on:click="isSwatch = true"
        v-tooltip:right="'Select from swatch'"
      )
        img.colorpicker-icon(
          :src="require('../static/vue-static/colorpicker.png')"
        )
      .icon(
        v-else
        v-on:click="isSwatch = false"
        v-tooltip:right="'Select from predefined colors'"
        v-html="$creatorCommonIcons.colors"
      )

</template>

<script>
import { mapState } from 'vuex'
import stageService from '../services/stage/stage'
import config from '../config'

const COLORS = config.colors.softColors
const DEFAULT_COLOR = COLORS[0]

export default {
  name: 'ColorPicker',
  components: {
    'picker': () => import('vue-color').then(({ Chrome }) => Chrome)
  },
  props: {
    initialColor: {
      default: '',
      type: String
    }
  },
  data () {
    return {
      isSwatch: false,
      calculatedColor: this.initialColor || DEFAULT_COLOR,
      color: this.initialColor || DEFAULT_COLOR,
      colors: COLORS,
      TYPE_TEXT_COLOR_PICKER: stageService.TYPE_TEXT_COLOR_PICKER
    }
  },
  computed: {
    ...mapState({
      initColor: state => state.common.colorPickerColor
    })
  },
  watch: {
    initColor: function () {
      this.color = this.initColor
    },
    color: function () {
      if (this.color) {
        this.calculatedColor = this.color
        this.$root.$emit('colorPicked', this.color)
      }
    },
    calculatedColor: function () {
      if (this.calculatedColor.hex) {
        this.color = this.calculatedColor.hex
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .color-picker {
    width: 244px;
    position: absolute;
    left: 16px;
    background-color: #fff;
    box-shadow: 0 0 2px #aaa;
    border-radius: 8px;
    overflow: hidden;

    &.show {
      top: 16px;
      opacity: 1;
      transition: 0.3s;
    }

    &.hide {
      top: -100%;
      opacity: 0;
      transition: 0.7s;
    }

    .colorpicker-icon {
      width: 20px;
      height: 20px;
    }

    .swatch {
      min-height: 281px;

      .input-container {
        padding: 14px;
        margin-top: 16px;

        .current-color {
          min-width: 36px;
          min-height: 36px;
          border-radius: 50%;
        }

        input {
          width: calc(100% - 8px);
          margin-left: 8px;
          border-radius: 4px;
          border: 1px solid #e8e8e8;
          padding: 0 8px;
          font-size: 16px;
        }
      }
    }

    .vc-chrome {
      width: auto;
      height: 154px;
      font-family: inherit;
      -webkit-box-shadow: none;
      box-shadow: none;
      padding: 14px;

      /deep/ .vc-hue--horizontal,
      /deep/ .vc-chrome-saturation-wrap {
        border-radius: 6px;
      }

      /deep/ .vc-hue-picker {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        margin-top: -1px;
      }

      /deep/ .vc-chrome-body {
        padding: 16px 0;
      }

      /deep/ .vc-chrome-fields-wrap,
      /deep/ .vc-chrome-color-wrap,
      /deep/ .vc-chrome-alpha-wrap {
        display: none;
      }
    }

    .colors {
      padding: 8px;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
      border-bottom: 1px solid #f4f4f4;
    }

    .column {
      display: flex;
      flex-direction: column;
    }

    .color {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      margin: 4px;
      cursor: pointer;
    }

    .icon {
      width: 29px;
      height: 29px;
    }

    .colors-icon {
      cursor: pointer;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      width: 28px;
      height: 29px;
      justify-content: space-between;

      .color {
        width: 13px;
        height: 13px;
        margin: 0;
      }
    }

    .footer {
      width: 100%;
      padding: 10px 14px;

      .color-hex {
        font-size: 16px;
        color: #1a1a1a;
        font-weight: 600;
      }

      .icon {
        cursor: pointer;
      }
    }
  }
</style>
