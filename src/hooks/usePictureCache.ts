import { type SkPicture } from '@shopify/react-native-skia'

const cache = new Map<string, SkPicture | undefined>()

export const usePictureCache = (
  key: string,
  pictureFactory: () => SkPicture | undefined,
  debug = false
) => {
  if (!cache.has(key)) {
    if (debug) {
      console.log('Cache MISS', key)
    }
    cache.set(key, pictureFactory())
  } else {
    if (debug) {
      console.log('Cache HIT', key)
    }
  }

  return cache.get(key)
}
