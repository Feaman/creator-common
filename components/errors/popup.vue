<template lang="pug">
  .popup-error(v-bind:class="{ shown: popupError, hidden: !popupError}")
    .text
      span {{ popupError }} Try again or&nbsp;
      span.refresh-link(v-on:click="reloadPage()") refresh
      span .
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'PopupError',
  computed: {
    ...mapState({
      popupError: state => state.common.errors.popup
    })
  },
  methods: {
    reloadPage () {
      location.reload()
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../assets/css/mixins';

  .popup-error {
    width: 100%;
    position: absolute;
    bottom: 0;
    z-index: 100;
    background-color: #FF3A3A;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;

    .text {
      font-size: 16px;
      color: #fff;

      .refresh-link {
        font-weight: bold;
        text-decoration: underline;
        cursor: pointer;
      }
    }

    &.shown {
      opacity: 1;
      @include delay()
    }

    &.hidden {
      opacity: 0;
      bottom: -48px;
      @include delay()
    }
  }
</style>
