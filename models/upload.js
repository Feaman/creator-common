'use strict'

import BaseModel from '~app/models/base'
import UploadService from 'icons8-creator-common/services/upload'

export default class Upload extends BaseModel {
  static handleUploads (files) {
    UploadService.handleUploads(files)
  }
}
