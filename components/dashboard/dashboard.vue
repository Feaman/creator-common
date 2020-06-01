<template lang="pug">
  .dashboard
    dashboard-header
    template(v-if="authChecked")
      dashboard-tabs(
        :tabName="currentTab"
        @tab-switched="currentTab = $event"
      )
      dashboard-content(
        :tabName="currentTab"
        :withActivities="withActivities"
      )
</template>

<script>
import { mapState } from 'vuex'

import DashboardHeader from './header.vue'
import DashboardTabs from './tabs.vue'
import DashboardContent from './content.vue'
import UserService from '../../services/user'

const TAB_TEMPLATES = UserService.TAB_TEMPLATES
const TAB_COLLAGES = UserService.TAB_COLLAGES

export default {
  components: {
    'dashboard-header': DashboardHeader,
    'dashboard-tabs': DashboardTabs,
    'dashboard-content': DashboardContent
  },
  props: {
    tabName: {
      default: TAB_TEMPLATES,
      type: String
    },
    withActivities: {
      default: true,
      type: Boolean
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
      templates: state => state.common.templates,
      collages: state => state.common.collages,
      authChecked: state => state.common.authChecked
    })
  },
  watch: {
    authChecked () {
      if (this.authChecked && this.collages && this.collages.items.length) {
        this.currentTab = this.TAB_COLLAGES
      }
    },
    collages () {
      if (!this.collages.total) {
        this.currentTab = this.TAB_TEMPLATES
      }
    }
  },
  methods: {
    switchTab (tab) {
      this.currentTab = tab
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
  position: relative;
  overflow: hidden;
}
</style>
