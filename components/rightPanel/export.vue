<template lang="pug">
  .export
    .content(v-if="!isLoading")
      .sizes
        .size(
          path
          @click="checkAndSave(EXPORT_ENTITY_SVG)"
        )
          .data
            .data-title
              div SVG
              .spacer
              .export-icon
                .icon(v-html="$creatorCommonIcons.downInRound")
            .row
              .export-size {{ stageRealWidth }} x {{ stageRealHeight }}
              .spacer
              .description Vector objects
          .payment-lock(v-if="!isLicenseVerified || !isActiveLicense")
            a.button(href="https://icons8.com/buy" target="_blank")
              span.icon(v-html="$creatorCommonIcons.lock")
              span Unlock for&nbsp;
              strong $20/month
        .size(
          v-for="size in sizesData"
          v-if="size.exportEntities.includes(EXPORT_ENTITY_PNG)"
          @click="checkAndSave(EXPORT_ENTITY_PNG, size)"
        )
          .data
            .data-title
              .title PNG {{ size.title }}
              .spacer
              .export-icon
                .icon(v-html="$creatorCommonIcons.downInRound")
            .row
              .export-size {{ size.description }}
              .spacer
              .option(
                @click.stop="setTransparency(size)"
              )
                .checkbox(
                  :class="{ checked: size.isTransparent }"
                )
                .label Transparent
      .share-container(v-if="currentCollage")
        .title.row
          .text Share
          .spacer
          .status.center(
            :class="{ show: copiedToClipboard }"
          ) Copied to clipboard!
        .collage-url
          input.share(id="collageUrl" v-model="shareUrl" readonly tabindex="-1")
          .copy-shadow
          button.copy(
            @click="copy()"
            tabindex="-1"
          ) Copy
        share.share-buttons.row.center(:shareUrl="shareUrl")
      .spacer
      .public
        .icon-container
          .icon(v-html="$creatorCommonIcons.heart")
        .info
          | We will share the best vectors, so your work might be public.
    template(v-else)
      .progress-container
        .loading-block
          .loader
          .export-title {{ description }}
        .error(v-if="error") {{ error }}
</template>

<script>
import { mapState } from 'vuex'
import config from '../../config'
import SvgService from '../../services/svg'
import StageService from '../../services/stage/stage'
import ShareComponent from './share'

const EXPORT_ENTITY_SVG = 'SVG'
const EXPORT_ENTITY_PNG = 'PNG'

const ERROR_MESSAGE = 'Oops... There is some error occured. Please try again later.'

export default {
  name: 'Export',
  components: {
    share: ShareComponent
  },
  data: function () {
    return {
      isLoading: false,
      copiedToClipboard: false,
      exportingEntity: null,
      EXPORT_ENTITY_SVG,
      EXPORT_ENTITY_PNG,
      filename: 'download.svg',
      error: null,
      description: null,
      toDownload: null,
      sizesData: [
        {
          title: 'S',
          greaterSideWidth: Math.ceil((config.stage.sideMaxWidth / 3) / 100) * 100,
          description: '',
          width: null,
          height: null,
          isTransparent: false,
          exportEntities: [
            EXPORT_ENTITY_SVG,
            EXPORT_ENTITY_PNG
          ]
        },
        {
          title: 'M',
          greaterSideWidth: Math.ceil((config.stage.sideMaxWidth / 3 * 2) / 100) * 100,
          description: '',
          width: null,
          height: null,
          isCurrent: false,
          isTransparent: false,
          exportEntities: [
            EXPORT_ENTITY_SVG,
            EXPORT_ENTITY_PNG
          ]
        },
        {
          title: 'L',
          greaterSideWidth: config.stage.sideMaxWidth,
          description: '',
          width: null,
          height: null,
          isCurrent: false,
          isTransparent: false,
          exportEntities: [
            EXPORT_ENTITY_SVG
          ]
        }
      ]
    }
  },
  computed: {
    ...mapState({
      stageRealWidth: state => state.common.stage.realWidth,
      stageRealHeight: state => state.common.stage.realHeight,
      stageGreaterSideWidth: state => state.common.stage.realWidth > state.common.stage.realHeight ? state.common.stage.realWidth : state.common.stage.realHeight,
      isActiveLicense: state => state.common.user && state.common.user.license && !state.common.user.license.expired,
      isLicenseVerified: state => state.common.licenseVerified,
      currentCollage: state => state.common.currentCollage
    }),
    shareUrl () {
      if (this.currentCollage) {
        return process.env.host + '/creator/illustration/' + this.currentCollage.id
      }
      return null
    }
  },
  watch: {
    stageRealWidth () {
      this.getSizeDescription()
    }
  },
  async mounted () {
    this.getSizeDescription()
  },
  methods: {
    checkAndSave (entity, size) {
      if (!(entity === this.EXPORT_ENTITY_SVG && (!this.isLicenseVerified || !this.isActiveLicense))) {
        this.toDownload = { entity, size }
        this.download()
      }
    },
    setTransparency (size) {
      size.isTransparent = !size.isTransparent
    },
    download () {
      if (this.toDownload) {
        switch (this.toDownload.entity) {
          case EXPORT_ENTITY_SVG:
            this.svgDownload(this.toDownload.size)
            break
          case EXPORT_ENTITY_PNG:
            this.pngDownload(this.toDownload.size)
            break
        }
        this.toDownload = null
      }
    },
    svgDownload () {
      this.exportingEntity = EXPORT_ENTITY_SVG
      this.isLoading = true
      this.error = null
      this.description = this.getExportTitle()
      SvgService.create()
        .then(blob => {
          // Save collage svg
          const currentCollage = this.$store.state.common.currentCollage
          const formData = new FormData()
          formData.append('file', blob, 'file.svg')
          StageService.api.saveCollageSvg(formData, currentCollage.id)

          setTimeout(() => {
            this.isLoading = false
          }, 2000)
        })
        .catch(error => {
          this.description = null
          this.error = `${error}`
          setTimeout(() => {
            this.isLoading = false
          }, 3000)
        })
    },
    pngDownload (size) {
      this.isLoading = true
      this.error = null
      this.exportingEntity = EXPORT_ENTITY_PNG
      this.$nextTick(() => {
        StageService.download(size.isCurrent ? this.stageGreaterSideWidth : size.greaterSideWidth, size.isTransparent)
          .then(() => {
            this.isLoading = false
          })
          .catch(() => {
            this.error = ERROR_MESSAGE
          })
      })
    },
    getSizeDescription () {
      if (this.stageGreaterSideWidth) {
        this.sizesData.forEach((size, index) => {
          let sizeFrom, sizeTo
          let maxSideRatio = 1
          let isPreviousConditionMeet = false

          // Resolve left condition (more than)
          if (index === 0 && this.stageGreaterSideWidth >= 0) {
            isPreviousConditionMeet = true
          } else if (this.stageGreaterSideWidth >= this.sizesData[index - 1].greaterSideWidth) {
            isPreviousConditionMeet = true
          }

          const isCurrent = isPreviousConditionMeet && this.stageGreaterSideWidth <= size.greaterSideWidth
          if (!isCurrent) {
            maxSideRatio = this.sizesData[index].greaterSideWidth / this.stageGreaterSideWidth
          }

          sizeFrom = Math.ceil(this.stageRealWidth * maxSideRatio)
          sizeTo = Math.ceil(this.stageRealHeight * maxSideRatio)
          size.isCurrent = isCurrent
          size.width = sizeFrom
          size.height = sizeTo
          size.description = `${sizeFrom}x${sizeTo}`
        })
      }
    },
    stop () {
      this.isLoading = false
    },
    getExportTitle () {
      switch (this.exportingEntity) {
        case EXPORT_ENTITY_SVG:
          return 'Generating SVG file...'
        case EXPORT_ENTITY_PNG:
          return 'Generating PNG file...'
      }
    },
    copy () {
      const input = document.getElementById('collageUrl')
      input.classList.add('transparent-background')
      input.select()
      document.execCommand('copy')
      setTimeout(() => {
        window.getSelection().removeAllRanges()
        input.classList.remove('transparent-background')
      }, 250)

      this.copiedToClipboard = true
      setTimeout(() => {
        this.copiedToClipboard = false
      }, 2000)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/css/variables';
@import '../../assets/css/mixins';

.export {
  width: 100%;
  height: 100%;

  .content {
    min-height: calc(100vh - 56px);
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 16px 24px 24px 24px;

    .collage-url {
      height: 33px;
      display: flex;
      flex-direction: row;
      position: relative;
      z-index: 10;
      border-bottom: 1px solid $transparent-white-color;
      padding: 0 0 0 12px;

      input {
        &::selection {
          background-color: rgba(0, 0, 0, 0.5);
        }

        &.transparent-background {
          &::selection {
            background-color: transparent;
          }
        }
      }
    }

    .sizes {
      padding: 8px 0 0 0;

      .size {
        width: 100%;
        height: 80px;
        display: flex;
        flex-direction: column;
        position: relative;
        padding: 8px 0 0 12px;
        background-color: $transparent-white-color;
        margin: 0 0 8px 0;
        border-radius: 8px;
        cursor: pointer;

        &.is-current {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .option {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 10px 16px 12px 8px;
          cursor: pointer;

          &:hover .checkbox {
            border-color: #fff;

            &.checked {
              background-color: rgba(255, 255, 255, 0.6);
              border-color: transparent;
            }
          }

          &:active .checkbox {
            border-color: rgba(255, 255, 255, 0.4);

            &.checked {
              background-color: rgba(255, 255, 255, 0.3);
              border-color: transparent;
            }
          }

          .checkbox {
            width: 12px;
            height: 12px;
            position: relative;
            border-radius: 2px;
            border: 1px solid;
            border-color: rgba(255, 255, 255, 0.4);
            transition: border-color 0.2s, background-color 0.3s;

            &::after {
              content: '';
              width: 4px;
              height: 8px;
              position: absolute;
              left: 3px;
              top: 0px;
              opacity: 0;
              border: solid #212121;
              border-width: 0 2px 2px 0;
              transition: opacity 0.3s, transform 0.15s;
            }

            &.checked {
              background-color: #fff;

              &::after {
                opacity: 1;
                transform: rotate(45deg);
                transition: background-color 0.1s, opacity 0.1s, transform 0.5s;
              }
            }
          }

          .label {
            line-height: 17px;
            padding: 0 0 0 8px;
          }
        }

        .data {
          .data-title {
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            font-size: 24px;
            font-weight: bold;

            .title {
              line-height: 29px;
            }
          }

          .export-size {
            padding: 10px 0 12px 0;
          }

          .description {
            padding: 8px 12px 0 0;
          }

          .export-size, .description {
            color: $half-white-color;
            font-size: 14px;
          }
        }

        .export-icon {
          display: none;
          align-items: center;
          justify-content: center;
          padding: 0 12px 0 0;

          .icon {
            fill: $half-white-color;
          }
        }

        &:hover, &.active {
          transition: all 0.5s;
          background-color: rgba(255, 255, 255, 0.15);

          .export-icon {
            display: flex;
          }
        }
      }

      .payment-lock {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 10;
        background-color: rgba(33, 33, 33, 0.7);

        .button {
          padding: 12px 16px;

          .icon {
            fill: $main-background;
            margin-right: 8px;
          }
        }
      }
    }
  }

  .share-container {
    margin: 16px 0 0 0;
    border: 1px solid $transparent-white-color;
    border-radius: 6px;

    .title {
      padding: 12px;

      .text {
        font-size: 24px;
        line-height: 24px;
        font-weight: bold;
        text-transform: uppercase;
      }

      .status {
        width: 127px;
        font-size: 7px;
        color: #00A9F0;
        opacity: 0;
        transition: all 0.15s;

        &.show {
          opacity: 1;
          font-size: 14px;
        }
      }
    }

    .share-buttons {
      height: 70px;
    }
  }

  .progress-container {
    width: 100%;
    height: calc(100% - 56px);
    height: calc(var(--vh, 1vh) * 100 - 56px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .loading-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .loader {
        width: 56px;
        height: 56px;
        position: relative;
        @include loading(#fff, 4px, 56px);
      }

      .export-title {
        max-width: 200px;
        padding: 24px 0;
        text-align: center;
        color: $half-white-color;
        font-size: 14px;
        text-transform: uppercase;
      }
    }

    .error {
      max-width: 300px;
      color: #ff7171;
      padding: 0 0 24px 0;
      text-align: center;
      font-size: 22px;
    }
 }

  .share {
    width: calc(100% - 80px);
    height: 21px;
    border-radius: 10px;
    border: 0;
    outline: 0;
    line-height: normal;
    font-size: 14px;
    color: $half-white-color;
    background-color: transparent;
  }

  .copy {
    height: 32px;
    position: absolute;
    right: 0;
    background: transparent;
    border: 0;
    outline: 0;
    border-radius: 8px;
    color: #fff;
    line-height: normal;
    font-size: 14px;
    padding: 0 16px 11px 8px;
    cursor: pointer;

    &-shadow {
      position: absolute;
      right: 56px;
      background: linear-gradient(270deg, #212121 33.04%, rgba(55, 55, 55, 0) 100%);
      width: 56px;
      height: 100%;
    }
  }

  .public {
    display: flex;
    border: 1px solid rgba(255, 255, 255, .1);
    color: #909090;
    border-radius: 8px;
    margin: 24px 0 0 0;
    padding: 20px;

    .icon-container {
      width: 42px;
      min-width: 42px;
      height: 42px;
      min-height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20px;
      background-color: $transparent-white-color;
      border-radius: 100px;
    }

    .info {
      font-size: 15px;
      line-height: 21px;

      a {
        color: #fff;
        text-decoration: none;
      }
    }
  }
}
</style>
