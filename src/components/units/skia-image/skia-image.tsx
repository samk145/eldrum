import React, { useEffect } from 'react'
import {
  Image,
  useImage,
  type DataSourceParam,
  type ImageProps,
  type SkiaProps,
  type RectCtor,
  Mask,
  Rect,
  rect
} from '@shopify/react-native-skia'
import { logger } from '../../../helpers/logger'

type TSkiaImageProps = {
  source: DataSourceParam
  tint?: string // Must be Hex color
  onLoad?: () => void
} & Omit<SkiaProps<ImageProps>, 'image'> &
  Required<RectCtor>

export const SkiaImage = ({ source, tint, onLoad, ...restProps }: TSkiaImageProps) => {
  const image = useImage(source, error => {
    logger.error(error)
  })

  useEffect(() => {
    if (image) {
      onLoad?.()
    }
  }, [image])

  return (
    <Mask mode="alpha" mask={<Image image={image} {...restProps} />}>
      <Rect rect={rect(restProps.x, restProps.y, restProps.width, restProps.height)} color={tint} />
    </Mask>
  )
}
