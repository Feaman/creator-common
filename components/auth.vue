<template lang="pug">
  .auth
    .loader(v-if="loading")
    template(v-else)
      template(v-if="short")
        template(v-if="isUserRole")
          .sub-menu-row.first(
            v-if="!hideMyCollages && collages.total"
            @click="showUserCollages()"
          )
            .link
              .icon(v-html="$creatorCommonIcons.collages")
              .text My vectors
              .spacer
              .badge {{ collages.total }}
          .sub-menu-row(
            :class="{ first: !collages.total }"
          )
            a.link(href="https://icons8.com/profile/summary" target="_blank")
              .icon(v-html="$creatorCommonIcons.account")
              div My Accont
          .sub-menu-row(
            @click="logout"
          )
            .link
              .icon(v-html="$creatorCommonIcons.logout")
              div Logout
        template(v-else)
          .sub-menu-row.first(
            @click="$modal.show('login-modal')"
          )
            .link
              .icon(v-html="$creatorCommonIcons.login")
              div Login
      template(v-else)
        template(v-if="isUserRole")
          .logged-in(
            v-if="isUserRole"
            @click="showMenu = !showMenu"
            ref="menuButton"
          )
            .icon(v-html="$creatorCommonIcons.rasterUser" v-if="!user.license")
            .icon(v-html="$creatorCommonIcons.allAccess" v-else)
            .menu-icon.small(v-html="$creatorCommonIcons.menuArrowDown")
        template(v-else)
          div.button.green.login-button(
            @click="$modal.show('login-modal')"
          )
            .icon(v-html="$creatorCommonIcons.icons8")
            div Login with Icons8
    transition(name="scale-fade")
      .sub-menu(
        v-show="showMenu && user"
        ref="menu"
      )
        .sub-menu-row(
          v-if="!hideMyCollages && collages.total"
          @click="showUserCollages()"
        )
          .link
            .icon(v-html="$creatorCommonIcons.collages")
            .text My vectors
            .spacer
            .badge {{ collages.total }}
        .sub-menu-row
          a.link(href="https://icons8.com/profile/summary" target="_blank")
            .icon(v-html="$creatorCommonIcons.account")
            div My Account
        .sub-menu-row(@click="logout")
          .link
            .icon(v-html="$creatorCommonIcons.logout")
            div Logout
    app-modal(
      ref="modal"
      name="login-modal"
      v-bind:width="520"
      v-bind:contentClass="'login-modal'"
    )
      login-form(@success="success")
</template>

<script>
import { mapState } from 'vuex'

import UserService from '../services/user'
import CollageService from '../services/collage'

export default {
  name: 'Auth',
  props: {
    short: {
      default: false,
      type: Boolean
    },
    hideMyCollages: {
      default: false,
      type: Boolean
    }
  },
  data () {
    return {
      loading: true,
      showMenu: false,
      urlPrefix: process.env.urlPrefix,
      icons8UserLoaded: false
    }
  },
  computed: {
    ...mapState({
      user: state => state.common.user,
      collages: state => state.common.collages,
      isUserRole: state => state.common.user && state.common.user.roles.find(role => role === 'user')
    })
  },
  created () {
    if (process.browser) {
      if (this.user) {
        this.getCollages()
      } else {
        this.getUser()
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
    getNotifications () {
      if (this.isUserRole) {
        UserService.getNotifications()
      }
    },
    getUser () {
      UserService.getUser()
        .then(() => {
          if (this.user) {
            if (process.browser) {
              this.getCollages()
            }
            this.getNotifications()
          }
        })
        .catch(error => console.log(error))
    },
    getCollages () {
      CollageService.getCollages({ per_page: 100 })
        .then(() => {
          this.loading = false
          this.$store.dispatch('common/setAuthChecked', true)
        })
    },
    showUserCollages () {
      this.showMenu = false
      this.getNotifications()
      this.$router.push({ name: `${this.urlPrefix.replace(/\//g, '')}-dashboard`, params: { tabName: UserService.TAB_COLLAGES } })
    },
    logout () {
      this.loading = true
      this.showMenu = false
      this.$store.dispatch('logoutUser')
        .then(() => this.getUser())
    },
    success () {
      this.getUser()
    },
    outsideClick (event) {
      if (
        this.$refs.menu &&
        this.$refs.menuButton &&
        !this.$refs.menu.contains(event.target) &&
        !this.$refs.menuButton.contains(event.target)
      ) {
        this.showMenu = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/css/mixins";
@import "../assets/css/effects";

.auth {
  position: relative;
  height: 32px;
  min-width: 47px;
  color: #fff;
  flex-shrink: 0;

  .loader {
    width: 32px;
    height: 32px;
    position: relative;
    margin: 0 auto;
    @include loading(#fff, 3px, 24px);
  }

  .icon {
    fill: #fff;
  }

  .logged-in {
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor: pointer;

    .menu-icon {
      margin-left: 5px;
      opacity: 0.5;
    }

    .email {
      margin: 0 3px 0 8px;
    }

    .icon {
      min-width: 32px;
      min-height: 32px;
      width: 32px;
      height: 32px;
      border-radius: 27px;
      overflow: hidden;
    }
  }

  .login-button {
    min-width: 168px;

    .icon {
      width: 28px;
      height: 18px;
      padding-right: 10px;
      fill: #fff;
    }
  }
}
</style>
