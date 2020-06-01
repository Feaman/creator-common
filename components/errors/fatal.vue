<template lang="pug">
  .error-page.center
    .container(
      :class="`error-image-${Math.floor(Math.random() * 3) + 1}`"
    )
      .main.column
        .status {{ error.statusCode }}.
        .text Something went wrong.
        .spacer
        .button.black(v-on:click="$router.push(`${urlPrefix}/dashboard`)")
          span.icon(v-html="$creatorCommonIcons.arrowLeft")
          span Dashboard
    .mobile-spacer.spacer
    .image-block
      img(:src="require(`../../static/vue-static/error${Math.floor(Math.random() * 3) + 1}.png`)")
</template>

<script>
export default {
  name: 'ErrorTemplate',
  props: {
    error: {
      required: true,
      type: Object
    }
  },
  data () {
    return {
      urlPrefix: process.env.urlPrefix,
      styles: {}
    }
  },
  created () {
    console.error(`${this.error.statusCode} ERROR: ${this.error.message}`)
  }
}
</script>

<style lang="scss" scoped>
$big: 1270px;
$medium: 860px;
$errorImage1: url('../../static/vue-static/error1.png');
$errorImage2: url('../../static/vue-static/error2.png');
$errorImage3: url('../../static/vue-static/error3.png');

.error-page {
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
  transition: 0.5s;
  color: #1A1A1A;
  display: flex;
  position: relative;
  z-index: 10;
  overflow: hidden;
  background-color: #fff;

  @media (min-width: 0) {
    flex-direction: column;
  }
  @media (min-width: $medium) {
    flex-direction: row;
  }

  .container {
    @media (min-width: 0) {
      width: calc(100% - 80px);
      height: 100%;
      margin: 52px 40px 0 40px;
    }
    @media (min-width: $medium) {
      width: 1100px;
      height: 376px;
      margin: 0 100px;
      background-repeat: no-repeat;
      background-position: right bottom;
      background-size: auto 55%;
    }

    &.error-image-1 {
      @media (min-width: $medium) {
        background-image: $errorImage1;
      }
      @media (min-width: 1150px) {
        background-position: right center;
        background-size: auto 100%;
      }
    }

    &.error-image-2 {
      @media (min-width: $medium) {
        background-image: $errorImage2;
      }
      @media (min-width: 1270px) {
        background-position: right center;
        background-size: auto 100%;
      }
    }

    &.error-image-3 {
      @media (min-width: $medium) {
        background-image: $errorImage3;
      }
      @media (min-width: 1200px) {
        background-position: right center;
        background-size: auto 100%;
      }
    }

    .main {
      @media (min-width: 0) {
        height: auto;
      }
      @media (min-width: $medium) {
        height: 100%;
      }

      .status {
        font-size: 70px;
        font-weight: bold;
        line-height: 71px;
        letter-spacing: -3px;
        text-transform: uppercase;
        color: #1A1A1A;
      }

      .text {
        width: 100%;
        max-width: 680px;
        text-transform: uppercase;
        font-style: normal;
        font-weight: 700;
        margin-top: 6px;
        color: #fff;
        word-wrap: break-word;
        -webkit-text-stroke-width: 1.5px;
        -webkit-text-stroke-color: #000;

        @media (min-width: 0) {
          font-size: 40px;
          line-height: 64px;
        }
        @media (min-width: $medium) {
          font-size: 70px;
          line-height: 80px;
        }
      }

      .button {
        height: 53px;
        border-radius: 100px;

        @media (min-width: 0) {
          width: 100%;
          margin-top: 22px;
        }
        @media (min-width: $medium) {
          width: 173px;
        }

        .icon {
          width: 14px;
          height: 20px;
          fill: #fff;
          margin-right: 7px;
        }
      }
    }
  }

  .mobile-spacer {
    @media (min-width: $medium) {
      display:none;
    }
  }

  .image-block {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 40px;

    @media (min-width: 0) {
      max-height: calc(100% - 410px);
      height: calc(100% - 410px);
    }
    @media (min-width: $medium) {
      display:none;
    }

    img {
      @media (min-width: 0) {
        width: 100%;
        height: 100%;
        max-height: 100%;
        object-fit: contain;
      }
      @media (min-width: $medium) {
        display: none;
      }
    }
  }
}
</style>
