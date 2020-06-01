import { RegularPolygon } from 'konva'

export default {
  webSocket: {
    host: 'wss://photos.icons8.com/api/generate/ws',
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000
  },
  itemsMoveStep: 0.5,
  minimumItemWidth: 5,
  colors: {
    hardColors: [
      '#4d565b',
      '#52595f',
      '#cacdd6',
      '#e4e4e4',
      '#f1f1f1',
      '#676455',
      '#8a8172',
      '#f4e3cf',
      '#f1eada',
      '#f8f3ed',
      '#533a3d',
      '#956863',
      '#f6c8cb',
      '#f3dae0',
      '#f9eaed',
      '#5f4d59',
      '#685e77',
      '#d1cce0',
      '#dddbe6',
      '#eee5ea',
      '#3e4f56',
      '#5c758b',
      '#b4d1e3',
      '#d0e1eb',
      '#e5ecf2',
      '#425041',
      '#647c80',
      '#b4cec5',
      '#dae4d9',
      '#ddf1f0'
    ],
    softColors: [
      '#96999a',
      '#bfbfbf',
      '#c8ced3',
      '#e4e4e4',
      '#f1f1f1',
      '#f8dea6',
      '#ded2bd',
      '#f2e4d0',
      '#f2e9db',
      '#f8f4ed',
      '#e0b1b7',
      '#e8aaa4',
      '#f5c7c9',
      '#f3dadf',
      '#f7ecec',
      '#c6acaa',
      '#bfb3d5',
      '#d1cddf',
      '#dddbe4',
      '#ede5ea',
      '#84acc2',
      '#9db8d1',
      '#b3d1e2',
      '#d1e0e9',
      '#e6edf2',
      '#9cbbc2',
      '#aec4c7',
      '#b4cdc5',
      '#d9e5d6',
      '#ddf1ef'
    ]
  },
  text: {
    resizeStep: 2,
    defaultText: 'Example text',
    fonts: [
      {
        id: 1,
        title: 'Abril Fatface',
        styles: [
          { style: 'regular', weight: 400, initial: true }
        ],
        fontName: 'AbrilFatface'
      },
      {
        id: 2,
        title: 'Acme',
        styles: [
          { style: 'regular', weight: 400, initial: true }
        ],
        fontName: 'Acme'
      },
      {
        id: 3,
        title: 'Bai Jamjuree',
        styles: [
          { style: 'regular', weight: 400, initial: true },
          { style: 'bold', weight: 700 },
          { style: 'italic', weight: 400 }
        ],
        fontName: 'BaiJamjuree'
      },
      {
        id: 4,
        title: 'Bowlby One SC',
        styles: [
          { style: 'regular', weight: 400, initial: true }
        ],
        fontName: 'BowlbyOneSC'
      },
      {
        id: 5,
        title: 'Caveat',
        styles: [
          { style: 'regular', weight: 400, initial: true },
          { style: 'bold', weight: 700 }
        ],
        fontName: 'Caveat'
      },
      {
        id: 6,
        title: 'Cinzel',
        styles: [
          { style: 'regular', weight: 400, initial: true },
          { style: 'bold', weight: 700 },
          { style: 'italic', weight: 400 }
        ],
        fontName: 'Cinzel'
      },
      {
        id: 7,
        title: 'EB Garamond',
        styles: [
          { style: 'regular', weight: 400, initial: true },
          { style: 'bold', weight: 700 },
          { style: 'italic', weight: 400 }
        ],
        fontName: 'EBGaramond'
      },
      {
        id: 8,
        title: 'IBM Plex Sans',
        styles: [
          { style: 'regular', weight: 400 },
          { style: 'bold', weight: 700, initial: true },
          { style: 'italic', weight: 400 }
        ],
        fontName: 'IBMPlexSans'
      },
      {
        id: 9,
        title: 'IBM Plex Serif',
        styles: [
          { style: 'regular', weight: 400 },
          { style: 'bold', weight: 700, initial: true },
          { style: 'italic', weight: 400 }
        ],
        fontName: 'IBMPlexSerif'
      },
      {
        id: 10,
        title: 'Merriweather',
        styles: [
          { style: 'regular', weight: 400, initial: true },
          { style: 'bold', weight: 700 },
          { style: 'italic', weight: 400 }
        ],
        fontName: 'Merriweather'
      },
      {
        id: 11,
        title: 'Miriam Libre',
        styles: [
          { style: 'regular', weight: 400, initial: true },
          { style: 'bold', weight: 700 }
        ],
        fontName: 'MiriamLibre'
      },
      {
        id: 12,
        title: 'Nunito',
        styles: [
          { style: 'regular', weight: 400 },
          { style: 'bold', weight: 700, initial: true },
          { style: 'italic', weight: 400 }
        ],
        fontName: 'Nunito'
      },
      {
        id: 13,
        title: 'Open Sans',
        styles: [
          { style: 'regular', weight: 400 },
          { style: 'bold', weight: 700, initial: true },
          { style: 'italic', weight: 400 }
        ],
        fontName: 'OpenSans'
      },
      {
        id: 14,
        title: 'Permanent Marker',
        styles: [
          { style: 'regular', weight: 400, initial: true }
        ],
        fontName: 'PermanentMarker'
      },
      {
        id: 15,
        title: 'Playfair Display',
        styles: [
          { style: 'regular', weight: 400 },
          { style: 'bold', weight: 700, initial: true },
          { style: 'italic', weight: 400 }
        ],
        fontName: 'PlayfairDisplay'
      },
      {
        id: 16,
        title: 'Poppins',
        styles: [
          { style: 'regular', weight: 400 },
          { style: 'bold', weight: 700, initial: true },
          { style: 'italic', weight: 400 }
        ],
        fontName: 'Poppins'
      },
      {
        id: 17,
        title: 'Rammetto One',
        styles: [
          { style: 'regular', weight: 400, initial: true }
        ],
        fontName: 'RammettoOne'
      },
      {
        id: 18,
        title: 'Rock Salt',
        styles: [
          { style: 'regular', weight: 400, initial: true }
        ],
        fontName: 'RockSalt'
      },
      {
        id: 19,
        title: 'Staatliches',
        styles: [
          { style: 'regular', weight: 400, initial: true }
        ],
        fontName: 'Staatliches'
      }
    ]
  },
  leftPanel: {
    minWidth: 344,
    windowWidthToHide: 1024
  },
  artBoardMinWidth: 500,
  itemMaxRatio: 2,
  stage: {
    borderLock: 10,
    margin: {
      left: 36
    },
    minWidth: 100,
    minHeight: 100,
    sideMaxWidth: 5000,
    defaultSizePreset: 0,
    sizesPresets: [
      {
        title: 'Classic',
        ratio: '3:2',
        category: 'camera',
        width: 1200,
        height: 800
      },
      {
        title: 'Standard',
        ratio: '4:3',
        category: 'camera',
        width: 1600,
        height: 1200
      },
      {
        title: 'Wide',
        ratio: '16:9',
        category: 'camera',
        width: 1280,
        height: 720
      },
      {
        title: 'Square',
        ratio: '1:1',
        category: 'camera',
        width: 1500,
        height: 1500
      },
      {
        title: 'Instagram story',
        category: 'social',
        width: 1080,
        height: 1920
      },
      {
        title: 'Facebook cover',
        category: 'social',
        width: 850,
        height: 315
      },
      {
        title: 'Twitter header',
        category: 'social',
        width: 1500,
        height: 500
      },
      {
        title: 'iPhone XS',
        category: 'phone',
        width: 1125,
        height: 2436
      },
      {
        title: 'iPhone XS Max',
        category: 'phone',
        width: 1242,
        height: 2688
      },
      {
        title: 'Samsung S9',
        category: 'phone',
        width: 1440,
        height: 2960
      }
    ]
  },
  defaultBackgroundColor: '#ffffff'
}
