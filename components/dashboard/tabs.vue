<template lang="pug">
  .tabs(v-if="collages.total")
    .tab(
      :class="{ active: currentTab === TAB_TEMPLATES }"
      @click="switchTab(TAB_TEMPLATES)"
    ) Templates
    .tab(
      :class="{ active: currentTab === TAB_COLLAGES }"
      @click="switchTab(TAB_COLLAGES)"
    )
      .text My Vectors
      .badge {{ collages.items.length }}
</template>

<script>
import { mapState } from 'vuex'

import UserService from '../../services/user'

const TAB_TEMPLATES = UserService.TAB_TEMPLATES
const TAB_COLLAGES = UserService.TAB_COLLAGES

export default {
  props: {
    tabName: {
      default: TAB_TEMPLATES,
      type: String
    }
  },
  data () {
    return {
      currentTab: this.tabName,
      TAB_TEMPLATES,
      TAB_COLLAGES
    }
  },
  computed: {
    ...mapState({
      collages: state => state.common.collages
    })
  },
  watch: {
    collages () {
      this.switchTab(this.collages.items.length ? TAB_COLLAGES : TAB_TEMPLATES)
    }
  },
  methods: {
    switchTab (tab) {
      this.currentTab = tab
      this.$emit('tab-switched', tab)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/css/mixins';
@import '../../assets/css/variables';

.tabs {
  display: flex;
  flex-direction: row;
  position: relative;

  @media (min-width: 0) {
    border-top: 1px solid $transparent-white-color;
    margin: 0 0 12px 0;
  }
  @media (min-width: 480px) {
    border-bottom: 1px solid $transparent-white-color;
    border-top: none;
    margin: 0 72px 32px 72px;
  }

  .tab {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    color: #777777;
    font-size: 14px;
    cursor: pointer;

    @media (min-width: 0) {
      width: 50%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      border-top: 2px solid transparent;
      font-size: 16px;
      padding: 16px 0 24px 0;
    }
    @media (min-width: 480px) {
      width: auto;
      height: 34px;
      border-bottom: 2px solid transparent;
      border-top: none;
      padding: 0 16px 10px 16px;
    }

    .badge {
      margin-left: 8px;
      background-color: #777777;
    }

    &.active, &:hover {
      color: #bbb;
      @include delay();

      .badge {
        background-color: #fff;
      }
    }

    &.active::after {
      content: '';
      width: 100%;
      position: absolute;
      left: 0;
      bottom: -4px;
      color: #fff;
      @include delay();

      @media (min-width: 480px) {
        border-bottom: 2px solid #fff;
      }
    }

    &.active::before {
      content: '';
      width: 100%;
      position: absolute;
      left: 0;
      top: -4px;
      color: #fff;
      @include delay();

      @media (min-width: 0) {
        border-top: 2px solid #fff;
      }

      @media (min-width: 480px) {
        border-top: none;
      }
    }
  }
}
</style>
