import React, { useRef, memo, useEffect } from 'react'
import { PixelRatio, StyleSheet } from 'react-native'
import { Canvas, ClipOp, createPicture, Picture, Skia } from '@shopify/react-native-skia'
import {
  skiaImageCache,
  BUTTON_SIDE_ORIGINAL_HEIGHT,
  BUTTON_SIDE_ORIGINAL_WIDTH,
  LINE_ORIGINAL_HEIGHT,
  LINE_ORIGINAL_WIDTH
} from '../../../../assets/graphics/skia-images'
import { usePictureCache } from '../../../../hooks'

function getSideVariant(number: number) {
  if (number < 0.3333) {
    return 0
  } else if (number < 0.6666) {
    return 1
  }

  return 2
}

const ButtonBackground = memo(function ButtonBackground({
  width,
  height,
  sideWidth,
  tint = '#000'
}: {
  width: number
  height: number
  sideWidth: number
  tint?: string | undefined
}) {
  const { cachedImages } = skiaImageCache
  const randomNumberA = useRef(Math.random()).current
  const randomNumberB = useRef(Math.random()).current
  const topOffset = (randomNumberA * LINE_ORIGINAL_WIDTH) / 9
  const bottomOffset = (randomNumberB * LINE_ORIGINAL_WIDTH) / 9
  const sideLeftVariantIndex = getSideVariant(randomNumberA)
  const sideRightVariantIndex = getSideVariant(randomNumberB)
  const roundedSideWidth = PixelRatio.roundToNearestPixel(sideWidth)
  const picture = usePictureCache(
    `buttonBackground-${width}-${height}-${roundedSideWidth}-${sideLeftVariantIndex}-${sideRightVariantIndex}-${tint}`,
    () => {
      if (!cachedImages) {
        return
      }

      return createPicture(
        canvas => {
          const paint = Skia.Paint()

          paint.setColorFilter(
            Skia.ColorFilter.MakeMatrix([
              0,
              0,
              0,
              0,
              Skia.Color(tint)[0], // Red
              0,
              0,
              0,
              0,
              Skia.Color(tint)[1], // Green
              0,
              0,
              0,
              0,
              Skia.Color(tint)[2], // Blue
              0,
              0,
              0,
              1,
              0 // Alpha
            ])
          )

          const lineWidth = PixelRatio.roundToNearestPixel(width - roundedSideWidth * 2)
          const lineImageWidth = PixelRatio.roundToNearestPixel(LINE_ORIGINAL_WIDTH / 3)
          const lineImageHeight = PixelRatio.roundToNearestPixel(LINE_ORIGINAL_HEIGHT / 3)

          // Center piece
          canvas.drawRect(
            {
              x: sideWidth,
              y: lineImageHeight,
              height: height - lineImageHeight * 2,
              width: lineWidth
            },
            paint
          )

          // Left side
          canvas.drawImageRect(
            cachedImages.buttonLeftSides[sideLeftVariantIndex],
            { x: 0, y: 0, width: BUTTON_SIDE_ORIGINAL_WIDTH, height: BUTTON_SIDE_ORIGINAL_HEIGHT },
            { x: 0, y: 0, width: roundedSideWidth, height },
            paint
          )

          // Top Line
          canvas.save()
          canvas.clipRect(
            { x: roundedSideWidth, y: 0, width: lineWidth, height: lineImageHeight },
            ClipOp.Intersect,
            true
          )
          canvas.drawImageRect(
            cachedImages.lineTop,
            { x: topOffset, y: 0, width: LINE_ORIGINAL_WIDTH, height: LINE_ORIGINAL_HEIGHT },
            {
              x: roundedSideWidth - topOffset,
              y: 0,
              width: lineImageWidth,
              height: lineImageHeight
            },
            paint
          )
          canvas.restore()

          // Bottom Line
          canvas.save()
          canvas.clipRect(
            {
              x: roundedSideWidth,
              y: height - lineImageHeight,
              width: lineWidth,
              height: lineImageHeight
            },
            ClipOp.Intersect,
            true
          )
          canvas.drawImageRect(
            cachedImages.lineBottom,
            { x: 0, y: 0, width: LINE_ORIGINAL_WIDTH, height: LINE_ORIGINAL_HEIGHT },
            {
              x: roundedSideWidth - bottomOffset,
              y: height - lineImageHeight,
              width: lineImageWidth,
              height: lineImageHeight
            },
            paint
          )
          canvas.restore()

          // Right side
          canvas.drawImageRect(
            cachedImages.buttonRightSides[sideRightVariantIndex],
            { x: 0, y: 0, width: BUTTON_SIDE_ORIGINAL_WIDTH, height: BUTTON_SIDE_ORIGINAL_HEIGHT },
            {
              x: width - roundedSideWidth,
              y: 0,
              width: roundedSideWidth,
              height
            },
            paint
          )
        },
        {
          width: PixelRatio.roundToNearestPixel(width),
          height: PixelRatio.roundToNearestPixel(height)
        }
      )
    }
  )

  useEffect(() => {
    if (!cachedImages) {
      skiaImageCache.generateCache()
    }
  }, [cachedImages])

  return (
    <Canvas
      style={[
        style.container,
        {
          height: PixelRatio.roundToNearestPixel(height),
          width: PixelRatio.roundToNearestPixel(width)
        }
      ]}
    >
      {picture && <Picture picture={picture} />}
    </Canvas>
  )
})

const style = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: -1,
    top: 0,
    left: 0
  }
})

export default ButtonBackground
