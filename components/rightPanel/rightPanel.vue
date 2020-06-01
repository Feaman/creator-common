<template lang="pug">
  .right-panel(
    :class="{ shown: showRightPanel, hidden: !showRightPanel }"
    ref="rightPanel"
  )
    header Export
    .close-button.icon(
      v-html="$creatorCommonIcons.close"
      @click="$store.dispatch('common/showRightPanel', false)"
    )
    .content
      .scroll-container(
        v-app-scroll
        ref="scrollContainer"
      )
        export
</template>

<script>
import { mapState } from 'vuex'
import Export from './export'

export default {
  name: 'RightPanel',
  components: {
    export: Export
  },
  computed: {
    ...mapState({
      showRightPanel: state => state.common.showRightPanel,
      showBackdrop: state => state.common.showBackdrop
    })
  },
  watch: {
    showRightPanel: function () {
      this.$store.dispatch('common/showBackdrop', this.showRightPanel)
    },
    showBackdrop: function () {
      if (!this.showBackdrop) {
        this.$store.dispatch('common/showRightPanel', false)
      }
    }
  },
  mounted () {
    document.addEventListener('mousedown', this.outsideClick)
  },
  destroyed () {
    document.removeEventListener('mousedown', this.outsideClick)
  },
  methods: {
    outsideClick (event) {
      if (this.$refs.rightPanel && !this.$refs.rightPanel.contains(event.target)) {
        this.$store.dispatch('common/showRightPanel', false)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/css/mixins';
@import '../../assets/css/variables';

.right-panel {
  width: 100%;
  max-width: 394px;
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
  transition: 0.5s;
  position: absolute;
  top: 0;
  bottom: 0;
  background-color: $panel-background-color;
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 40;
  color: #fff;

  header {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 16px;
    height: 56px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    color: $half-white-color;
    padding-left: 24px;
  }

  .content {
    height: calc(100% - 56px);

    .scroll-container {
      height: 100%;
    }
  }

  &.shown {
    right: 0;
    @include delay()
  }

  &.hidden {
    right: -100%;
    @include delay()
  }

  &.mobile {
    width: 100%;
  }
}
</style>
