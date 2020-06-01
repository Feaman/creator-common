<template lang="pug">
  .dashboard-content(:class="{ 'logged-in': isLoggedIn }")
    transition(name="slide-fade" mode="out-in")
      .templates-page(
        v-if="currentTab === TAB_TEMPLATES"
        :key="TAB_TEMPLATES"
      )
        .collages-container(
          :key="TAB_TEMPLATES"
        )
          .scroll-container(
            v-app-scroll
            ref="scrollContainer"
          )
            .collages
              .collage.new(@click="startFromScratch()")
                .content
                  .new-container
                    .plus
                      .plus-icon(v-html="$creatorCommonIcons.plus")
                    .add-text Create new vector
              .collage(
                v-for="template in templates"
                @click="$router.push(`${urlPrefix}/template/${template.id}`)"
                ref="collage"
              )
                .content
                  img(:src="template.preview.url")
      .user-page(
        v-if="currentTab === TAB_COLLAGES && user"
        :class="{ 'show-activities': showActivities }"
        :key="TAB_COLLAGES"
      )
        .activities-container(
          v-if="showActivities"
          ref="activitiesContainer"
        )
          activities(
            @expanded="moveActivitiesToTop()"
            @shrinked="moveActivitiesToList()"
            ref="activities"
          )
        .collages-container(
          v-if="currentTab === TAB_COLLAGES && !hideUserCollages" :key="TAB_COLLAGES"
          ref="collagesContainer"
        )
          .scroll-container(
            v-app-scroll
            ref="scrollContainer"
          )
            .collages
              .collage.new(
                @click="startFromScratch()"
                :key="0"
              )
                .content
                  .new-container
                    .plus
                      .plus-icon(v-html="$creatorCommonIcons.plus")
                    .add-text Create new vector
              .collage.user-collage(
                v-for="(collage, index) in collages.items"
                @click="$router.push(`${urlPrefix}/illustration/${collage.id}`)"
                :key="collage.id"
                ref="collage"
              )
                .content
                  transition(name="fade")
                    .restore(
                      v-if="collage.isDeleted"
                      @click.stop
                    )
                      .restore-panel.column.center
                        .restore-text Vector has been deleted
                        .restore-button(@click.stop="restoreCollage(collage)") Undo
                  .info(v-if="!collage.isDeleted")
                    .duplicate-button(
                      @click.stop="duplicateCollage(collage)"
                      v-tooltip:bottom="'Duplicate'"
                    )
                      .button-loader(v-if="collage.isDuplicating")
                      .icon(
                        v-else
                        v-html="$creatorCommonIcons.copySmall"
                      )
                    .delete-button(
                      @click.stop="deleteCollage(collage, index)"
                      v-tooltip:bottom="'Delete'"
                    )
                      .button-loader(v-if="collage.isDeleting")
                      .icon(
                        v-else
                        v-html="$creatorCommonIcons.bin2"
                      )
                    .row
                      .details(v-tooltip:bottom="getFullDateFromTimestamp(collage.updated)")
                        span.info-date Last edit {{ getDateFromTimestamp(collage.updated) }}
                      .spacer
                  img(
                    v-if="collage.preview"
                    :src="collage.preview.url"
                  )
</template>

<script>
import { mapState } from 'vuex'
import UserService from '../../services/user'
import CollageService from '../../services/collage'
import Utils from '../../utils/index'

const TAB_TEMPLATES = UserService.TAB_TEMPLATES
const TAB_COLLAGES = UserService.TAB_COLLAGES

export default {
  components: {
    'activities': () => import('./activities.vue'),
    'infinite-scroll': () => import('./activities.vue')
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
      test: false,
      isDuplicating: false,
      isDeleting: false,
      getDateFromTimestamp: Utils.getDateFromTimestamp,
      getFullDateFromTimestamp: Utils.getFullDateFromTimestamp,
      TAB_TEMPLATES,
      TAB_COLLAGES,
      currentTab: this.tabName,
      urlPrefix: process.env.urlPrefix,
      hideUserCollages: false
    }
  },
  computed: {
    ...mapState({
      user: state => state.common.user,
      collages: state => state.common.collages,
      collagesTotal: state => state.common.collages.total,
      templates: state => state.common.templates,
      isLoggedIn: state => state.common.user && state.common.user.roles.find(role => role === 'user')
    }),
    showActivities () {
      const user = this.$store.state.common.user
      return this.withActivities && user && user.roles.find(role => role === 'user')
    }
  },
  watch: {
    collagesTotal () {
      if (!this.collagesTotal) {
        setTimeout(() => {
          this.hideUserCollages = true
          this.currentTab = this.TAB_TEMPLATES
        }, 3000)
      }
    },
    tabName () {
      this.currentTab = this.tabName
    }
  },
  methods: {
    moveActivitiesToTop () {
      this.$el.parentElement.appendChild(this.$refs.activities.$el)
    },
    moveActivitiesToList () {
      this.$refs.activitiesContainer.appendChild(this.$refs.activities.$el)
    },
    startFromScratch () {
      this.$router.push(`${this.urlPrefix}/new`)
    },
    duplicateCollage (collage) {
      CollageService.duplicate(collage, false)
    },
    deleteCollage (collage) {
      CollageService.delete(collage)
    },
    restoreCollage (collage) {
      CollageService.restore(collage)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/css/mixins';
@import '../../assets/css/variables';
@import '../../assets/css/effects';

.dashboard-content {
  .templates-page, .user-page {
    @media (min-width: 0) {
      height: calc(100vh - 87px);
      height: calc(var(--vh, 1vh) * 100 - 87px);
    }
    @media (min-width: 480px) {
      height: calc(100vh - 96px);
      height: calc(var(--vh, 1vh) * 100 - 96px);
    }
  }

  &.logged-in {
    .templates-page, .user-page {
      @media (min-width: 0) {
        height: calc(100vh - 166px);
        height: calc(var(--vh, 1vh) * 100 - 166px);
      }
      @media (min-width: 480px) {
        height: calc(100vh - 163px);
        height: calc(var(--vh, 1vh) * 100 - 163px);
      }
    }
  }

  .scroll-container {
    width: 100%;
    height: 100%;

    /deep/ .simplebar-scrollbar::before {
      background-color: #fff;
    }
  }

  .collages-container {
    width: 100%;
    height: 100%;
  }

  .collages {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;

    @media (min-width: 0) {
      margin: -8px 8px 24px 8px;
    }

    @media (min-width: 480px) {
      margin: -8px 64px 24px 64px;
    }

    .collage {
      background-color: #262626;
      margin: 8px;
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;

      @media (min-width: 0px) {
        width: 100%;
      }
      @media (min-width: 570px) {
        width: calc(50% - 16px);
      }
      @media (min-width: 1024px) {
        width: calc(33.333% - 16px);
      }
      @media (min-width: 1440px) {
        width: calc(25% - 16px);
      }
      @media (min-width: 1920px) {
        width: calc(16.666% - 16px);
      }

      .content {
        height: 0;
        display: flex;
        align-items: center;
        position: relative;
        padding-bottom: 66.666%; /* 1200:800 */

        .restore {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          top: 0;
          z-index: 10;
          background-color: rgba(0, 0, 0, 0.7);
          color: #000;

          .restore-panel {
            position: absolute;
            background-color: #fff;
            border-radius: 6px;
            padding: 12px 16px;

            .restore-text {
              font-size: 14px;
              line-height: 20px;
              margin-bottom: 6px;
            }

            .restore-button {
              font-size: 14px;
              line-height: 17px;
              padding: 8px 16px;
              background-color: rgba(51, 51, 51, 0.1);
              border-radius: 6px;

              &:hover {
              background-color: rgba(51, 51, 51, 0.2);
              }
            }
          }
        }

        img {
          height: 100%;
          width: 100%;
          position: absolute;
          top: 0;
          left: 0;
          object-fit: contain;
        }
      }
    }

    .new {
      border: 1px dashed #444;
      background-color: transparent;

      .new-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .plus {
        width: 60px;
        height: 60px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 60px;
        background-color: #484848;
        margin: 0 0 24px 0;

        .plus-icon {
          width: 32px;
          height: 32px;
        }
      }

      .add-text {
        font-size: 16px;
        font-weight: normal;
      }

      &:hover {
        background-color: #212121;
        @include delay()
      }
    }

    .user-collage {
      .info {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 0 0 8px 8px;
        position: absolute;
        top: 0;
        z-index: 20;

        @media (min-width: 0) {
          opacity: 1;
          background: none;
        }
        @media (min-width: 425px) {
          opacity: 0;
          background: rgba(0, 0, 0, 0.3);
        }

        .duplicate-button, .delete-button {
          width: 32px;
          height: 32px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          background-color: rgba(0, 0, 0, 0.4);
          border-radius: 32px;

          @media (min-width: 0) {
            bottom: 8px;
          }
          @media (min-width: 425px) {
            top: 8px;
            bottom: initial;
          }

          .button-loader {
            @include loading(#fff, 2px, 16px);
          }
        }

        .delete-button {
          right: 8px;

          &:hover {
            background-color: #FF5659;
            @include delay()
          }

          .icon {
            fill: #fff;
          }
        }

        .duplicate-button {
          right: 48px;

          &:hover {
            background-color: rgba(0, 0, 0, 0.6);
            @include delay()
          }

          .icon {
            fill: #fff;
          }
        }

        .details {
          background: rgba(0, 0, 0, 0.5);
          border-radius: 6px;
          padding: 4px 12px;

          @media (min-width: 0) {
            display: none;
          }
          @media (min-width: 425px) {
            display: block;
          }

          &-date {
            color: #fff;
            font-size: 16px;
          }
        }
      }

      &:hover .info {
        opacity: 1;
        @include delay(0.1s)
      }
    }
  }

  .user-page {
    display: flex;

    @media (min-width: 0) {
      flex-direction: column;
    }
    @media (min-width: 700px) {
      flex-direction: row;
    }

    &.show-activities {
      .scroll-container{
        @media (max-width: 700px) {
          height: calc(100vh - 394px);
          height: calc(var(--vh, 1vh) * 100 - 394px);
        }
      }

      .collages {
        @media (min-width: 700px) {
          margin: -8px 64px 25px 8px;
        }
      }

      .collage {
        @media (min-width: 700px) {
          width: 100%;
        }
        @media (min-width: 1024px) {
          width: calc(50% - 16px);
        }
        @media (min-width: 1220px) {
          width: calc(33.333% - 16px);
        }
        @media (min-width: 1600px) {
          width: calc(25% - 16px);
        }
      }
    }

    .activities-container {
      @media (min-width: 0) {
        margin: -8px 16px 25px 16px;
      }
      @media (min-width: 480px) {
        margin: -8px 72px 25px 72px;
      }
      @media (min-width: 700px) {
        margin: 0 0 32px 72px;
      }
    }
  }
}
</style>
