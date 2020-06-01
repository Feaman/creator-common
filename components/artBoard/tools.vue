<template lang="pug">
  .tools.row.center
    .icon.undo(
      @click="undo()"
      v-html="$creatorCommonIcons.undo"
      v-tooltip:bottom="'Undo'"
      :class="{ disabled: !undoStackSize }"
      ref="undo"
    )
    .icon.redo(
      @click="redo()"
      v-html="$creatorCommonIcons.redo"
      v-tooltip:bottom="'Redo'"
      :class="{ disabled: !redoStackSize }"
      ref="redo"
    )
    .menu(
      @click="showMenu = !showMenu"
      v-tooltip:bottom="'Menu'"
      ref="menuButton"
    )
      .icon(v-html="$creatorCommonIcons.dotsMenu")
    transition(name="scale-fade")
      .sub-menu(
        v-show="showMenu"
        :class="{ 'to-center': narrowScreen }"
        ref="menu"
      )
        .sub-menu-row(@click="createNew()")
          .link
            .icon(v-html="$creatorCommonIcons.roundPlus")
            div Create new
        .sub-menu-row(
          @click="duplicateCurrentCollage()"
        )
          .link
            .icon(v-html="$creatorCommonIcons.copy")
            div Duplicate
        .sub-menu-row.first(
          v-if="hideRotateButton"
          @click="rotate()"
        )
          .link(@click="showMenu = false")
            .icon(v-html="$creatorCommonIcons.rotate")
            div Rotate
        .sub-menu-row(v-if="hideStageSizes")
          .link(@click="showMenu = false")
            .icon(v-html="$creatorCommonIcons.resize")
            .stage-sizes-container
              stage-sizes-header(:short="true")
        auth(
          v-if="hideAuthButton"
          @click="showMenu = false"
          :short="true"
        )
    .spacer
    .icon.rotate(
      v-if="!hideRotateButton"
      @click="rotate()"
      v-html="$creatorCommonIcons.rotate"
      v-tooltip:bottom="'Rotate stage'"
      ref="rotate"
    )
    .stage-sizes-container(
      v-if="!hideStageSizes"
      ref="stageSizesHeader"
    )
      stage-sizes-header
    .spacer
    .autosave-status {{ autosaveStatusText }}
    .button(
      @click="$store.dispatch('common/showRightPanel', !showRightPanel)"
      ref="export"
    ) Export
    auth(
      v-if="!hideAuthButton"
      @click="showMenu = false"
      ref="auth"
    )
    .sizes-container(
      :class="{ shown: showStageSizes, hidden: !showStageSizes }"
      ref="stageSizesPanel"
    )
      stage-sizes-panel
    .success(:class="{ shown: success, hidden: !success }") {{ success }}
</template>

<script>
import { mapState } from 'vuex'
import StageSizesHeader from './stageSizes/header'
import StageSizesPanel from './stageSizes/panel'
import CollageService from '../../services/collage'
import StageService from '../../services/stage/stage'
import BaseService from '../../services/base'
import CommandManager from '../../services/history/commandManager'
import Auth from '../auth'

export default {
  name: 'Tools',
  components: {
    auth: Auth,
    'stage-sizes-header': StageSizesHeader,
    'stage-sizes-panel': StageSizesPanel
  },
  data () {
    return {
      showMenu: false,
      hideRotateButton: false,
      hideStageSizes: false,
      hideAuthButton: false,
      narrowScreen: false,
      narrowWidth: 0,
      minEmptyWidthToShrink: 0,
      rotateButtonWidth: 0,
      stageSizesWidth: 0,
      authButtonWidth: 0,
      toolsPaddings: {},
      success: false,
      subMenuPositions: {},
      urlPrefix: process.env.urlPrefix
    }
  },
  computed: {
    ...mapState({
      showStageSizes: state => state.common.stage.showSizes,
      artboardWidth: state => state.common.artboard.width,
      autosaveStatus: state => state.common.autosave.status,
      showRightPanel: state => state.common.showRightPanel,
      undoStackSize: state => state.common.history.undoStackSize,
      redoStackSize: state => state.common.history.redoStackSize,
      stageRealWidth: state => state.common.stage.realWidth,
      stageRealHeight: state => state.common.stage.realHeight,
      authChecked: state => state.common.authChecked,
      isUserRole: state => state.common.user && state.common.user.roles.find(role => role === 'user'),
      currentCollage: state => state.common.currentCollage,
      stage: state => state.common.stage
    }),
    showActivities () {
      const user = this.$store.state.common.user
      return this.withActivities && user && user.roles.find(role => role === 'user')
    },
    autosaveStatusText () {
      let autosaveStatusText = ''

      switch (this.autosaveStatus) {
        case CollageService.AUTOSAVE_STATUS_SAVING:
          autosaveStatusText = 'Saving...'
          break
        case CollageService.AUTOSAVE_STATUS_SAVED:
          autosaveStatusText = 'Saved'
          break
        case CollageService.AUTOSAVE_STATUS_ERROR:
          autosaveStatusText = 'Not saved'
          break
      }

      return autosaveStatusText
    }
  },
  watch: {
    artboardWidth: function () {
      this.checkWidth()
    },
    stage: function () {
      if (this.stage.showSizes) {
        this.showMenu = false
      }
    },
    showMenu: function () {
      if (this.showMenu) {
        this.$nextTick(() => this.calculateSubMenuPosition())
      }
    },
    stageRealWidth () {
      this.$nextTick(() => this.checkWidth())
    },
    stageRealHeight () {
      this.$nextTick(() => this.checkWidth())
    },
    authChecked: function () {
      this.$nextTick(() => this.checkWidth())
    },
    isUserRole: function () {
      this.$nextTick(() => this.checkWidth())
    }
  },
  mounted () {
    document.addEventListener('mousedown', this.outsideClick)
    BaseService.$tools = this.$el

    // Calculate paddings to include them to the component width calculation later
    this.toolsPaddings.left = parseInt(document.defaultView.getComputedStyle(this.$el).paddingLeft, 10)
    this.toolsPaddings.right = parseInt(document.defaultView.getComputedStyle(this.$el).paddingRight, 10)
    this.subMenuPositions.left = parseInt(document.defaultView.getComputedStyle(this.$refs.menu).left, 10)
    this.subMenuPositions.right = parseInt(document.defaultView.getComputedStyle(this.$refs.menu).right, 10)

    this.checkWidth()
  },
  destroyed () {
    document.removeEventListener('mousedown', this.outsideClick)
  },
  methods: {
    checkWidth () {
      let elementsWidth = 0
      const toolsWidth = this.$el.offsetWidth - this.toolsPaddings.left - this.toolsPaddings.right
      const autosaveTextWidth = 86
      const elements = [
        this.$refs.undo,
        this.$refs.redo,
        this.$refs.menuButton,
        this.$refs.export
      ]
      elements.forEach($element => {
        if ($element) {
          const leftMargin = parseInt(document.defaultView.getComputedStyle($element).marginLeft, 10)
          const rightMargin = parseInt(document.defaultView.getComputedStyle($element).marginRight, 10)
          elementsWidth += $element.offsetWidth + leftMargin + rightMargin
        }
      })
      this.rotateButtonWidth = this.getElementFullWidth(this.$refs.rotate) || this.rotateButtonWidth
      this.stageSizesWidth = this.getElementFullWidth(this.$refs.stageSizesHeader) || this.stageSizesWidth
      this.authButtonWidth = this.$refs.auth ? this.getElementFullWidth(this.$refs.auth.$el) : this.authButtonWidth
      elementsWidth += this.rotateButtonWidth + this.stageSizesWidth + this.authButtonWidth + autosaveTextWidth
      this.hideRotateButton = toolsWidth - elementsWidth <= this.minEmptyWidthToShrink
      this.hideStageSizes = toolsWidth - elementsWidth + this.rotateButtonWidth <= this.minEmptyWidthToShrink
      this.hideAuthButton = toolsWidth - elementsWidth + this.rotateButtonWidth + this.stageSizesWidth <= this.minEmptyWidthToShrink

      this.calculateSubMenuPosition()
    },
    createNew () {
      const newPath = `${this.urlPrefix}/new`
      if (this.$route.path === newPath) {
        this.$router.go(newPath)
      } else {
        this.$router.push(newPath)
      }
    },
    duplicateCurrentCollage () {
      if (this.currentCollage) {
        CollageService.duplicate(this.currentCollage)
          .then(() => {
            this.showMenu = false
            this.success = `Your collage has been duplicated!`
            setTimeout(() => {
              this.success = null
            }, 2000)
          })
      }
    },
    calculateSubMenuPosition () {
      const $subMenu = this.$refs.menu
      this.narrowScreen = $subMenu && $subMenu.offsetWidth + this.subMenuPositions.left + 12 > this.artboardWidth
    },
    getElementFullWidth ($element) {
      if ($element) {
        return $element.offsetWidth +
        parseInt(document.defaultView.getComputedStyle($element).marginLeft, 10) +
        parseInt(document.defaultView.getComputedStyle($element).marginRight, 10)
      }
      return 0
    },
    undo () {
      if (this.undoStackSize) {
        CommandManager.undo()
      }
    },
    redo () {
      if (this.redoStackSize) {
        CommandManager.redo()
      }
    },
    rotate () {
      StageService.rotate()
    },
    outsideClick (event) {
      if (!this.$refs.menu.contains(event.target) && !this.$refs.menuButton.contains(event.target)) {
        this.showMenu = false
      }
      if (
        (
          this.$refs.stageSizesHeader &&
          !this.$refs.stageSizesHeader.contains(event.target) &&
          !this.$refs.stageSizesPanel.contains(event.target)
        ) || (!this.$refs.stageSizesHeader && !this.$refs.stageSizesPanel.contains(event.target))) {
        this.$store.dispatch('common/setStage', { showSizes: false })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/css/variables';
@import '../../assets/css/mixins';
@import '../../assets/css/effects';

.tools {
  width: 100%;
  position: relative;
  padding: 0 24px;
  border-bottom: 1px solid $barely-white-color;

  .autosave-status {
    width: 70px;
    font-size: 14px;
    margin-right: 16px;
    text-align: right;
  }

  @media (min-width: 0) {
    height: 44px;
    min-height: 44px;
  }
  @media (min-width: 1024px) {
    height: 56px;
    min-height: 56px;
  }

  .icon {
    cursor: pointer;

    &:active {
      opacity: 0.5;
    }

    &.disabled {
      opacity: 0.3;
      cursor: initial;
    }
  }

  .redo {
    margin-right: 24px;
  }

  .menu, .undo {
    margin-right: 16px;
  }

  .menu {
    position: relative;

  }

  .sub-menu {
    width: 250px;
    left: 88px;
    right: auto;
    white-space: nowrap;

    @media (min-width: 0) {
      top: 40px;
    }
    @media (min-width: 1024px) {
      top: 52px;
    }

    &.to-center {
      left: 50%;
      transform: translate(-50%, 0);
    }

    .auth {
      width: 100%;
      height: auto;
      margin: 0;
    }
  }

  .rotate {
    margin-right: 12px;
  }

  .auth {
    margin-left: 16px;
  }

  .stage-sizes-container {
    height: 100%;
  }

  .sizes-container {
    width: 270px;
    max-height: calc(100vh - 45px);
    max-height: calc(var(--vh, 1vh) * 100 - 45px);
    border-radius: 8px;
    position: absolute;
    left: 50%;
    overflow: hidden;
    transform: translate(-50%, 0);

    &.shown {
      opacity: 1;
      top: 45px;
      transition: top 0.2s ease-in-out, opacity 0.2s ease-in-out;
    }

    &.hidden {
      pointer-events: none;
      z-index: -2;
      opacity: 0;
      top: 12px;
      transition: top 0.2s ease-in-out, opacity 0.2s ease-in-out;
    }
  }

  .success {
    min-width: 250px;
    left: calc(50% - 125px);
    background-color: #000;
    position: absolute;
    z-index: 10;
    padding: 16px;
    border-radius: 100px;
    opacity: 0.9;
    white-space: nowrap;
    text-align: center;
    overflow: hidden;

    &.shown {
      opacity: 1;
      top: 72px;
      transition: top 0.3s, opacity 0.5s;
    }

    &.hidden {
      top: -72px;
      opacity: 0;
      transition: top 0.5s, opacity 0.3s;
    }
  }
}
</style>
