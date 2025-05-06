import React from 'react'
import {
  Image,
  type SkImage,
  type ImageProps,
  type SkiaProps,
  type RectCtor,
  Mask,
  Rect,
  rect
} from '@shopify/react-native-skia'

type TCardBackgroundPartProps = {
  image: SkImage
  tint?: string // Must be Hex color
} & Omit<SkiaProps<ImageProps>, 'image'> &
  Required<RectCtor>

export const CardBackgroundPart = ({ image, tint, ...restProps }: TCardBackgroundPartProps) => {
  return (
    <Mask mode="alpha" mask={<Image image={image} {...restProps} />}>
      <Rect rect={rect(restProps.x, restProps.y, restProps.width, restProps.height)} color={tint} />
    </Mask>
  )
}
