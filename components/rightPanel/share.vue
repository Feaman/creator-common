<template lang="pug">
  .sn
    .sn-icon(
      v-html="$creatorCommonIcons['social/s_fb']"
      @click="openSharer(facebookUrl)"
    )
    .sn-icon(
      v-html="$creatorCommonIcons['social/s_t']"
      @click="openSharer(twitterUrl)"
    )
    .sn-icon(
      v-html="$creatorCommonIcons['social/s_vk']"
      @click="openSharer(vkUrl)"
    )
    .sn-icon(
      v-html="$creatorCommonIcons['social/s_r']"
      @click="openSharer(redditUrl)"
    )
    .sn-icon(
      v-html="$creatorCommonIcons['social/s_p']"
      @click="openSharer(pinterestUrl)"
    )
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Share',
  props: {
    shareUrl: {
      type: String,
      default: null
    }
  },
  data: function () {
    return {
      sharePopupConfig: {
        status: false,
        resizable: true,
        toolbar: false,
        menubar: false,
        scrollbars: false,
        location: false,
        directories: false,
        width: 626,
        height: 436,
        top: 0,
        left: 0,
        interval: null
      },
      sharePopup: undefined
    }
  },
  computed: {
    ...mapState({
      userCollage: state => state.common.currentCollage
    }),
    facebookUrl () {
      return `http://www.facebook.com/sharer/sharer.php?u=${this.encoded(this.shareUrl)}`
    },
    twitterUrl () {
      return `https://twitter.com/intent/tweet?url=${this.encoded(this.shareUrl)}&text=${this.encoded('Photo Creator — A tool for creating stock photo scenes')}&hashtags=photo,photocreator&via=icons8photo&related=icons_8`
    },
    vkUrl () {
      return `https://vk.com/share.php?url=${this.encoded(this.shareUrl)}&image=${this.encoded(this.userCollage.preview.url || this.userCollage.preview)}&title=${this.encoded('Конструктор стоковых фотографий')}`
    },
    redditUrl () {
      return `https://reddit.com/submit/?url=${this.encoded(this.shareUrl)}&resubmit=true&title=${this.encoded('Photo Creator — A tool for creating stock photo scenes')}`
    },
    pinterestUrl () {
      return `https://pinterest.com/pin/create/button/?url=${this.encoded(this.shareUrl)}&media=${this.encoded(this.userCollage.preview.url || this.userCollage.preview)}&description=${this.encoded('Photo Creator — A tool for creating stock photo scenes')}`
    }
  },
  methods: {
    encoded (string) {
      return encodeURIComponent(string)
    },
    openSharer (url) {
      const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left
      const dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top

      const width = window.innerWidth ? window.innerWidth : (document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width)
      const height = window.innerHeight ? window.innerHeight : (document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height)

      this.sharePopupConfig.left = ((width / 2) - (this.sharePopupConfig.width / 2)) + dualScreenLeft
      this.sharePopupConfig.top = ((height / 2) - (this.sharePopupConfig.height / 2)) + dualScreenTop

      if (this.sharePopup && this.sharePopupConfig.interval) {
        clearInterval(this.sharePopupConfig.interval)

        this.sharePopup.close() // Force close (for Facebook)
      }

      this.sharePopup = window.open(
        url,
        'sharer',
        'status=' + (this.sharePopupConfig.status ? 'yes' : 'no') +
        ',height=' + this.sharePopupConfig.height +
        ',width=' + this.sharePopupConfig.width +
        ',resizable=' + (this.sharePopupConfig.resizable ? 'yes' : 'no') +
        ',left=' + this.sharePopupConfig.left +
        ',top=' + this.sharePopupConfig.top +
        ',screenX=' + this.sharePopupConfig.left +
        ',screenY=' + this.sharePopupConfig.top +
        ',toolbar=' + (this.sharePopupConfig.toolbar ? 'yes' : 'no') +
        ',menubar=' + (this.sharePopupConfig.menubar ? 'yes' : 'no') +
        ',scrollbars=' + (this.sharePopupConfig.scrollbars ? 'yes' : 'no') +
        ',location=' + (this.sharePopupConfig.location ? 'yes' : 'no') +
        ',directories=' + (this.sharePopupConfig.directories ? 'yes' : 'no')
      )

      this.sharePopup.focus()

      // Create an interval to detect popup closing event
      this.sharePopupConfig.interval = setInterval(() => {
        if (this.sharePopup.closed) {
          clearInterval(this.sharePopupConfig.interval)

          this.sharePopup = undefined
        }
      }, 500)
    }
  }
}
</script>

<style lang="scss" scoped>
  .sn {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    &-icon {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      cursor: pointer;

      &:hover {
        transform: scale(1.1) translate(0.1%, 0.1%);
        transition: all 0.1s;
      }

      &:not(:last-child) {
        margin-right: 16px;
      }
    }
  }
</style>
