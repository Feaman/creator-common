<template lang="pug">
  header.dashboard-header.row.center(:class="{ 'logged-out': isLoggedOut }")
    .title.row
      .icon(v-html="$icons.logo")
      div vector creator
    .spacer
    auth(
      :hideMyCollages="true"
    )
</template>

<script>
import { mapState } from 'vuex'
import Auth from '../auth.vue'

export default {
  components: {
    'auth': Auth
  },
  computed: {
    ...mapState({
      isLoggedOut: state => !state.common.user || (state.common.user && state.common.user.roles.find(role => role === 'guest'))
    })
  }
}
</script>

<style lang="scss" scoped>
.dashboard-header {
  @media (min-width: 0) {
    height: 87px;
    padding: 32px 16px 24px 16px;
  }
  @media (min-width: 480px) {
    height: 96px;
    padding: 32px 72px 16px 72px;
  }

  .title {
    font-weight: bold;
    text-transform: uppercase;
    align-items: center;

    @media (min-width: 0) {
      font-size: 24px;
    }
    @media (min-width: 480px) {
      font-size: 32px;
    }

    .icon {
      width: 32px;
      height: 32px;
      margin: 0 16px 0 0;
    }
  }

  &.logged-out {
    .auth {
      @media (max-width: 600px) {
        width: 100%;
        height: auto;
        position: absolute;
        z-index: 10;
        bottom: 16px;
        left: 24px;

        /deep/ .login-button {
          width: calc(100% - 48px);
          height: 56px;
        }

        &:after {
          width: 100%;
          height: 56px;
          content: "";
          position: absolute;
          left: -16px;
          bottom: -16px;
          z-index: -1;
          background: -webkit-gradient(linear,left top,left bottom,from(rgba(33,33,33,0)),to(#212121));
          background: linear-gradient(180deg,rgba(33,33,33,0),#212121);
        }
      }
    }
  }
}
</style>
