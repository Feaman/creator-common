<template lang="pug">
  .categories(ref="categories")
    nuxt-link.back.row.center(:to="`${urlPrefix}/dashboard`")
      .icon(v-html="$creatorCommonIcons.arrowLeft")
      span Back
    .scroll-container(
      v-app-scroll
      ref="scrollContainer"
    )
      .container.column.center(:class="{ show: leftPanelShown }")
        .category.column.center(
          :class="{ active: currentCategory.name === category.name }"
          v-for="category in categories"
          v-on:click="select(category)"
        )
          .icon-container.center
            .icon(v-html="$icons[category.icon]")
            .icon.icon-hover(v-html="$icons[category.icon + 'Hover']")
          .title {{ category.title }}
</template>

<script>
import { mapState } from 'vuex'
import config from '../config'
import BaseService from '../services/base'
import TextModelClass from '~app/models/text'

export default {
  name: 'LeftPanelCategories',
  data () {
    return {
      urlPrefix: process.env.urlPrefix
    }
  },
  computed: {
    ...mapState({
      leftPanelShown: state => state.common.leftPanel.show,
      categories: state => state.common.categories,
      currentCategory: state => state.common.currentCategory
    })
  },
  mounted () {
    // Handle left panel size and floating state
    this.$store.dispatch('common/setLeftPanel', { floating: window.innerWidth <= config.leftPanel.windowWidthToHide })
    BaseService.$categories = this.$refs.categories

    TextModelClass.loadFonts()
  },
  methods: {
    select (category) {
      // Show/hide left panel if it is necessary
      if (window.innerWidth < config.leftPanel.windowWidthToHide) {
        if (this.leftPanelShown && this.currentCategory === category) {
          this.hideLeftPanel()
        } else {
          this.showLeftPanel()
        }
      }

      this.$store.dispatch('common/setSearch', { show: false })
      this.$store.dispatch('common/setCurrentCategory', category)
    },
    hideLeftPanel () {
      this.$store.dispatch('common/setLeftPanel', { show: false })
    },
    showLeftPanel () {
      this.$store.dispatch('common/setLeftPanel', { show: true })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/css/mixins';
@import '../assets/css/variables';

.categories {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: $panel-background-color;
  overflow: hidden;

  @media (min-width: 0) {
    width: 44px;
    min-width: 44px;
  }
  @media (min-width: 1024px) {
    width: 108px;
    min-width: 108px;
  }

  &:before {
    content: '';
    height: 30px;
    position: absolute;
    z-index: 10;
    bottom: 0;
    background: linear-gradient(360deg, rgba(33, 33, 33, 1) 0%, rgba(0,0,0,0) 100%);

    @media (min-width: 0) {
      width: 44px;
      min-width: 44px;
    }
    @media (min-width: 1024px) {
      width: 108px;
      min-width: 108px;
    }
  }

  .back {
    position: relative;
    width: 100%;
    text-decoration: none;
    border-bottom: 1px solid $barely-white-color;
    border-right: 1px solid $barely-white-color;
    fill: $half-white-color;
    color: $half-white-color;
    font-size: 14px;
    transition: 0.2s;

    @media (min-width: 0) {
      height: 44px;
      min-height: 44px;
    }
    @media (min-width: 1024px) {
      height: 56px;
      min-height: 56px;
    }

    span {
      @media (min-width: 0) {
        display: none;
      }
      @media (min-width: 1024px) {
        display: initial;
      }
    }

    &:hover {
      color: #fff;
      fill: #fff;
    }
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding-top: 12px;
    overflow: auto;

    &.center {
      align-items: center;
      justify-content: end;
    }

    .category {
      width: 100%;
      min-width: 100%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 8px 0;
      cursor: pointer;

      @media (min-width: 0) {
        height: 32px;
        min-height: 32px;
      }
      @media (min-width: 1024px) {
        height: 56px;
        min-height: 56px;
      }

      .icon-container {
        width: 32px;
        height: 32px;
        margin: 0 auto;

        .icon {
          fill: $half-white-color;
        }

        .icon-hover {
          display: none;
        }
      }

      &:hover, &.active {
        .icon {
          fill: #fff;
        }

        .title {
          transition: color 0.3s;
          color: #fff;
        }
      }

      &.active {
        .icon-container {
          border-radius: 20px;
          background-color: $transparent-white-color;
          transition: background-color 0.3s;
        }
      }

      .title {
        margin: 2px 0 0 0;
        font-size: 12px;
        text-align: center;
        text-transform: capitalize;
        color: $half-white-color;

        @media (min-width: 0) {
          display: none;
        }
        @media (min-width: 1024px) {
          display: flex;
        }
      }

      &.active {
        .icon {
          display: none;
        }

        .icon-hover {
          display: block;
        }

        &::after {
          display: none;
        }

        .title {
          color: #fff;
        }
      }
    }
  }
}
</style>
