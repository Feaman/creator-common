<template lang="pug">
  .activities(:class="{ expanded }")
    .scroll-container(
      v-app-scroll
      ref="scrollContainer"
    )
      infinite-scroll(
        parentSelector=".simplebar-scroll-content"
        @infinite="loadMoreNotifications()"
      )

        .block

          .statistics
            h2 My Achievements
            .row
              .count {{ user.viewsCount }}&nbsp;
              .title views
            .row
              .count {{ user.downloadsCount }}&nbsp;
              .title downloads
            .row
              .count {{ user.likesCount }}&nbsp;
              .title likes
            .row
              .count {{ user.recomposedsCount }}&nbsp;
              .title recomposed
              .spacer
              a.more(@click="expand()") More

          .divider

          .notifications-container.spacer(:class="{ center: !notifications.items.length}")
            .notifications-loader(v-if="notifications.loading")
            notifications(
              v-else
              :notifications="notifications.items"
              :error="notificationsError"
              @load-more="loadMoreNotifications()"
              @mark-seen="markNotificationAsRead($event)"
              @following-photo="handlePhotoClick($event)"
              @following-user="handleUserClick($event)"
            )
              template(v-slot:blanklist)
                .empty You have no notifications. Create collages and people will notice you!

    .close-button(
      v-html="$creatorCommonIcons.close"
      @click="shrink()"
    )
</template>

<script>
import { mapState } from 'vuex'

import InfiniteScroll from 'icons8-common/src/components/appInfiniteScroll.vue'
import Notifications from 'icons8-common/src/components/appNotification.vue'
import UserService from '../../services/user'

export default {
  components: {
    'infinite-scroll': InfiniteScroll,
    'notifications': Notifications
  },
  data: () => {
    return {
      notificationsError: false,
      expanded: false
    }
  },
  computed: {
    ...mapState({
      user: state => state.common.user,
      notifications: state => state.common.notifications
    })
  },
  methods: {
    handleUserClick (userId) {
      window.open(`${process.env.host}/user/${userId}`, '_blank')
    },
    handlePhotoClick (data) {
      if (data.collageId) {
        this.$router.push(`/creator/photo/${data.collageId}`)
      } else {
        window.open(`${process.env.host}/photos/${data.photoId}`, '_blank')
      }
    },
    expand () {
      this.expanded = true
      this.$emit('expanded')
    },
    shrink () {
      this.expanded = false
      this.$emit('shrinked')
    },
    markNotificationAsRead (notificationId) {
      UserService.markNotificationAsRead(notificationId)
    },
    loadMoreNotifications () {
      UserService.loadMoreNotifications()
        .catch(() => {
          this.notificationsError = true
        })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/css/variables';
@import '../../assets/css/mixins';

.activities {
  height: 100%;
  overflow: hidden;
  background-color: #1F1F1F;

  @media (min-width: 0px) {
    width: 100%;
  }
  @media (min-width: 700px) {
    min-width: 376px;
    width: 376px;
  }

  .block {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .scroll-container {
    height: 100%;

    /deep/ .simplebar-content {
      display: flex;
    }

    /deep/ .simplebar-scrollbar::before {
      background-color: #fff;
    }
  }

  .infinite-scroller {
    width: 100%;
    padding: 0;
  }

  .notifications-container {
    display: flex;
    flex-direction: row;

    &.center {
      align-items: center;
      justify-content: center;
    }

    .app-notification {
      font-size: 14px;

      /deep/ .notification-item{
        /deep/ .avatar.is-multiply {
          border-color: #1F1F1F;
        }

        &:before {
          left: -15px;
        }
      }

      /deep/ .text, /deep/ .time {
        color: $half-white-color;
      }

      /deep/ .notification-list{
        padding: 0 24px;
      }

      /deep/ .notification-blank{
        padding: 24px;
      }

      /deep/ .notification-blank, /deep/ .error {
        font-size: 15px;
        color: $half-white-color;

        /deep/ .close-icon {
          fill: $half-white-color;
        }
      }
    }
  }

  h2 {
    font-size: 20px;
    font-weight: bold;
    text-transform: capitalize;
    margin: 0;
    padding: 0 0 8px 0;
  }

  .statistics {
    margin: 24px 24px 0 24px;
    padding: 0 0 16px 0;

    .row {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin: 8px 0;

      .count {
        font-size: 16px;
      }

      .title {
        color: $half-white-color;
        font-size: 14px;
      }
    }

    .more {
      color: $half-white-color;
      font-size: 14px;
      text-decoration: underline;
      cursor: pointer;

      @media (min-width: 0px) {
        display: flex;
      }
      @media (min-width: 700px) {
        display: none;
      }
    }
  }

  .divider {
    width: calc(100% - 48px);
    height: 1px;
    background-color: $transparent-white-color;
    margin: 0 24px;
  }

  .notifications {
    padding-top: 24px;
  }

  .notifications-container, .divider {
    @media (min-width: 0px) {
      display: none;
    }
    @media (min-width: 700px) {
      display: flex;
    }

    .notifications-loader {
      width: 56px;
      height: 56px;
      position: relative;
      @include loading(#fff, 4px, 56px);
    }
  }

  .close-button {
    display: none;
  }

  &.expanded {
    height: 100vh;
    height: calc(var(--vh, 1vh) * 100);
    position: absolute;
    z-index: 20;
    top: 0;
    left: 0;
    background-color: $main-background;

    .notifications-container, .divider {
      display: flex;
    }

    .more {
      display: none;
    }

    .close-button, .notifications, .divider {
      display: flex;
    }
  }
}
</style>
