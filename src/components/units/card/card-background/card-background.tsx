import React, { memo, useEffect } from 'react'
import { PixelRatio, StyleSheet } from 'react-native'
import { Canvas, ClipOp, createPicture, Picture, Skia } from '@shopify/react-native-skia'
import {
  skiaImageCache,
  LINE_ORIGINAL_HEIGHT,
  LINE_ORIGINAL_WIDTH,
  CARD_CORNER_ORIGINAL_SIZE
} from '../../../../assets/graphics/skia-images'
import { usePictureCache } from '../../../../hooks'

const DEFAULT_OPACITY = 1
export type TCardCorners = 'top' | 'bottom' | 'all' | 'none'

type TCardBackgroundProps = {
  width: number
  height: number
  tint: string
  cornerSize: number
  corners: TCardCorners
  opacity: number | undefined
  onLoad?: () => void
}

export const CardBackground = memo(function CardBackground({
  tint,
  cornerSize,
  corners,
  opacity = DEFAULT_OPACITY,
  width,
  height,
  onLoad
}: TCardBackgroundProps) {
  const { cachedImages } = skiaImageCache
  const roundedCornerSize = PixelRatio.roundToNearestPixel(cornerSize)
  const w = PixelRatio.roundToNearestPixel(width)
  const h = PixelRatio.roundToNearestPixel(height)
  const shouldRenderTop = corners === 'top' || corners === 'all'
  const shouldRenderBottom = corners === 'bottom' || corners === 'all'
  const sideLineHeight = shouldRenderBottom ? height - roundedCornerSize * 2 : height - cornerSize

  const picture = usePictureCache(
    `cardBackground-${width}-${height}-${cornerSize}-${shouldRenderBottom}-${tint}`,
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

          const lineWidth = PixelRatio.roundToNearestPixel(width - roundedCornerSize * 2)
          const lineImageWidth = PixelRatio.roundToNearestPixel(LINE_ORIGINAL_WIDTH / 3)
          const lineImageHeight = PixelRatio.roundToNearestPixel(LINE_ORIGINAL_HEIGHT / 3)

          const rrct = {
            rect: {
              x: shouldRenderTop ? lineImageHeight / 2 : 0,
              y: shouldRenderTop ? lineImageHeight / 2 : 0,
              width: width - lineImageHeight,
              height: shouldRenderBottom ? height - lineImageHeight : height
            },
            topLeft: { x: shouldRenderTop ? cornerSize : 0, y: shouldRenderTop ? cornerSize : 0 },
            topRight: { x: shouldRenderTop ? cornerSize : 0, y: shouldRenderTop ? cornerSize : 0 },
            bottomRight: {
              x: shouldRenderBottom ? cornerSize : 0,
              y: shouldRenderBottom ? cornerSize : 0
            },
            bottomLeft: {
              x: shouldRenderBottom ? cornerSize : 0,
              y: shouldRenderBottom ? cornerSize : 0
            }
          }

          // Center piece
          canvas.drawRRect(rrct, paint)

          if (shouldRenderTop) {
            // Card Top Left
            canvas.drawImageRect(
              cachedImages.cardTopLeft,
              { x: 0, y: 0, width: CARD_CORNER_ORIGINAL_SIZE, height: CARD_CORNER_ORIGINAL_SIZE },
              { x: 0, y: 0, width: roundedCornerSize, height: roundedCornerSize },
              paint
            )

            // Card Top Right
            canvas.drawImageRect(
              cachedImages.cardTopRight,
              { x: 0, y: 0, width: CARD_CORNER_ORIGINAL_SIZE, height: CARD_CORNER_ORIGINAL_SIZE },
              {
                x: w - roundedCornerSize,
                y: 0,
                width: roundedCornerSize,
                height: roundedCornerSize
              },
              paint
            )
          }

          // Card Bottom Right
          if (shouldRenderBottom) {
            canvas.drawImageRect(
              cachedImages.cardBottomRight,
              { x: 0, y: 0, width: CARD_CORNER_ORIGINAL_SIZE, height: CARD_CORNER_ORIGINAL_SIZE },
              {
                x: w - roundedCornerSize,
                y: h - roundedCornerSize,
                width: roundedCornerSize,
                height: roundedCornerSize
              },
              paint
            )

            // Card Bottom Left
            canvas.drawImageRect(
              cachedImages.cardBottomLeft,
              { x: 0, y: 0, width: CARD_CORNER_ORIGINAL_SIZE, height: CARD_CORNER_ORIGINAL_SIZE },
              {
                x: 0,
                y: h - roundedCornerSize,
                width: roundedCornerSize,
                height: roundedCornerSize
              },
              paint
            )
          }

          // Top Side
          canvas.save()
          canvas.clipRect(
            { x: roundedCornerSize, y: 0, width: lineWidth, height: lineImageHeight },
            ClipOp.Intersect,
            true
          )
          canvas.drawImageRect(
            cachedImages.lineTop,
            { x: 0, y: 0, width: LINE_ORIGINAL_WIDTH, height: LINE_ORIGINAL_HEIGHT },
            {
              x: roundedCornerSize,
              y: 0,
              width: lineImageWidth,
              height: lineImageHeight
            },
            paint
          )
          canvas.restore()

          // Right Side
          canvas.save()
          canvas.clipRect(
            {
              x: w - lineImageHeight,
              y: roundedCornerSize,
              width: lineImageHeight,
              height: sideLineHeight
            },
            ClipOp.Intersect,
            true
          )
          canvas.drawImageRect(
            cachedImages.lineRight,
            { x: 0, y: 0, width: LINE_ORIGINAL_HEIGHT, height: LINE_ORIGINAL_WIDTH },
            {
              x: w - lineImageHeight,
              y: 0,
              width: lineImageHeight,
              height: lineImageWidth
            },
            paint
          )
          canvas.restore()

          // Left Side
          canvas.save()
          canvas.clipRect(
            {
              x: 0,
              y: roundedCornerSize,
              width: lineImageHeight,
              height: sideLineHeight
            },
            ClipOp.Intersect,
            true
          )
          canvas.drawImageRect(
            cachedImages.lineLeft,
            { x: 0, y: 0, width: LINE_ORIGINAL_HEIGHT, height: LINE_ORIGINAL_WIDTH },
            {
              x: 0,
              y: 0,
              width: lineImageHeight,
              height: lineImageWidth
            },
            paint
          )
          canvas.restore()

          // Bottom Side
          canvas.save()
          canvas.clipRect(
            {
              x: roundedCornerSize,
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
              x: roundedCornerSize,
              y: height - lineImageHeight,
              width: lineImageWidth,
              height: lineImageHeight
            },
            paint
          )
          canvas.restore()
        },
        {
          width: w,
          height: h
        }
      )
    }
  )

  useEffect(() => {
    if (!cachedImages) {
      skiaImageCache.generateCache()
    }
  }, [cachedImages])

  useEffect(() => {
    if (picture) {
      onLoad?.()
    }
  }, [picture])

  return (
    <Canvas
      style={[
        style.container,
        {
          opacity,
          height: h,
          width: w
        }
      ]}
    >
      {picture && <Picture picture={picture} />}
    </Canvas>
  )
})

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'absolute',
    zIndex: -1,
    top: 0,
    left: 0,
    overflow: 'hidden'
  }
})
