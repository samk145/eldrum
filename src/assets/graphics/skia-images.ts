import { Image } from 'react-native'
import { Skia, type SkImage } from '@shopify/react-native-skia'
import { logger } from '../../helpers/logger'

const imgFactory = Skia.Image.MakeImageFromEncoded.bind(Skia.Image)

export const LINE_ORIGINAL_WIDTH = 3000
export const LINE_ORIGINAL_HEIGHT = 15
export const BUTTON_SIDE_ORIGINAL_WIDTH = 160
export const BUTTON_SIDE_ORIGINAL_HEIGHT = 160
export const CARD_CORNER_ORIGINAL_SIZE = 180

const BUTTON_LEFT_SIDES = [
  require('./button-left.png'),
  require('./button-left-2.png'),
  require('./button-left-3.png')
] as string[]

const BUTTON_RIGHT_SIDES = [
  require('./button-right.png'),
  require('./button-right-2.png'),
  require('./button-right-3.png')
] as string[]

const lineBottom = require('./line-bottom.png') as string
const lineTop = require('./line-top.png') as string
const lineLeft = require('./line-left.png') as string
const lineRight = require('./line-right.png') as string

const cardTopLeft = require('./card-top-left.png') as string
const cardTopRight = require('./card-top-right.png') as string
const cardBottomLeft = require('./card-bottom-left.png') as string
const cardBottomRight = require('./card-bottom-right.png') as string

export class SkiaImageCache {
  constructor() {
    this.generateCache()
  }

  isCaching: boolean = false

  cachedImages?: {
    lineTop: SkImage
    lineBottom: SkImage
    lineLeft: SkImage
    lineRight: SkImage
    buttonLeftSides: SkImage[]
    buttonRightSides: SkImage[]
    cardTopLeft: SkImage
    cardTopRight: SkImage
    cardBottomLeft: SkImage
    cardBottomRight: SkImage
  }

  static async cacheImage(source: string): Promise<SkImage> {
    const uri = typeof source === 'string' ? source : Image.resolveAssetSource(source).uri
    const data = await Skia.Data.fromURI(uri)
    const image = imgFactory(data)

    if (!image) {
      throw new Error('Failed to load image')
    }

    return image
  }

  async generateCache() {
    if (this.isCaching) {
      return
    }

    try {
      this.isCaching = true

      this.cachedImages = {
        lineTop: await SkiaImageCache.cacheImage(lineTop),
        lineBottom: await SkiaImageCache.cacheImage(lineBottom),
        lineLeft: await SkiaImageCache.cacheImage(lineLeft),
        lineRight: await SkiaImageCache.cacheImage(lineRight),
        buttonLeftSides: await Promise.all(
          BUTTON_LEFT_SIDES.map(SkiaImageCache.cacheImage.bind(this))
        ),
        buttonRightSides: await Promise.all(
          BUTTON_RIGHT_SIDES.map(SkiaImageCache.cacheImage.bind(this))
        ),
        cardTopLeft: await SkiaImageCache.cacheImage(cardTopLeft),
        cardTopRight: await SkiaImageCache.cacheImage(cardTopRight),
        cardBottomLeft: await SkiaImageCache.cacheImage(cardBottomLeft),
        cardBottomRight: await SkiaImageCache.cacheImage(cardBottomRight)
      }
    } catch (error) {
      logger.error(error)
    }

    this.isCaching = false
  }
}

export const skiaImageCache = new SkiaImageCache()
