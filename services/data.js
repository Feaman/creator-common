'use strict'

import BaseService from './base'

export default class Data extends BaseService {
  static getSeo (collage) {
    return {
      title: 'Ouch - Vector Creator',
      description: 'Don\'t search for vector illustrations. Create them.',
      googleTitle: 'Vector Creator',
      googleDescription: 'A tool for creating vector illustartion scenes',
      image: collage ? `${collage.preview && collage.preview.url}` : 'https://cdnd.icons8.com/download/mail/ouch-launch/ouch-share-image.png',
      url: `${process.env.host}/creator${collage ? `/illustration/${collage.id}` : ''}`
    }
  }
}
