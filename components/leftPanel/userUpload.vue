<template lang="pug">
  .user-upload
    .upload-button-container(:class="{ centered: isUploadsEmpty }")
      .upload-text(v-if="isUploadsEmpty") There will be images you’ve uploaded
      .upload-button-wrapper
        .upload-button(@click="$refs.input.click()")
          .icon.dark(v-html="$creatorCommonIcons.upload")
          span Upload
        input(type="file" @change="handleUpload" accept="image/png, image/jpeg", ref="input")
</template>

<script>
import { mapState } from 'vuex'
import UploadModel from '~app/models/upload'

export default {
  computed: {
    ...mapState({
      isUploadsEmpty: state => !state.common.entities.find(entity => entity.name === UploadModel.CLASS_NAME),
    })
  },
  methods: {
    handleUpload () {
      UploadModel.handleUploads(this.$refs.input.files)
    }
  }
}
</script>

<style lang="scss" scoped>
.user-upload {
  .upload-button-container {
    padding-bottom: 16px;
    width: 100%;

    &.centered {
      position: absolute;
      padding: 0 40px;
      top: 40%;
    }

    .upload-text {
      color: white;
      margin-bottom: 50px;
      text-align: center;
    }

    .upload-button-wrapper {
      position: relative;
      overflow: hidden;
      display: block;
    }

    .upload-button {
      width: 100%;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      font-size: 14px;
      line-height: normal;
      text-align: center;
      background-color: white;
      color: black;
      cursor: pointer;

      .icon {
        margin-right: 12px;
      }
    }

    .upload-button-wrapper input[type=file] {
      display: none;
    }
  }
}
</style>
