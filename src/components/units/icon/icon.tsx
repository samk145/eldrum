import React, { memo, useMemo } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import {
  Canvas,
  Group,
  Skia,
  type SkSVG,
  fitbox,
  rect,
  BlendMode,
  ImageSVG
} from '@shopify/react-native-skia'
import { svgIcons } from '../../../assets/graphics/svg-icons'
import { logger } from '../../../helpers/logger'

const DEFAULT_FILL = '#FFF'

export const svgsToSkiaSvgs = (svgs: Record<string, string>): Record<string, SkSVG> => {
  const convertedIcons: Record<string, SkSVG> = {}

  for (const [key, value] of Object.entries(svgs)) {
    const svg = Skia.SVG.MakeFromString(value)

    if (svg) {
      convertedIcons[key] = svg
    } else {
      console.error(`Failed to convert SVG icon ${key}`)
    }
  }

  return convertedIcons
}

const skiaIcons = svgsToSkiaSvgs(svgIcons)

export type TIcons = Record<string, SkSVG>

export type TIconProps<T extends TIcons = typeof skiaIcons> = {
  name: string
  height: number
  width: number
  fill?: string
  style?: StyleProp<ViewStyle>
  svgs?: T
}

export const Icon = memo(function Icon<T extends TIcons = typeof skiaIcons>({
  name,
  fill = DEFAULT_FILL,
  svgs = skiaIcons,
  style,
  height,
  width
}: TIconProps<T>) {
  const svg = svgs[name]

  if (!svg) {
    logger.warn(`Icon ${name} not found.`)
    return null
  }

  const paint = useMemo(() => Skia.Paint(), [])
  const src = useMemo(() => rect(0, 0, svg.width(), svg.height()), [])
  const dst = useMemo(() => rect(0, 0, width, height), [width, height])
  paint.setColorFilter(Skia.ColorFilter.MakeBlend(Skia.Color(fill), BlendMode.SrcIn))

  return (
    <Canvas
      style={[
        style,
        {
          width,
          height
        }
      ]}
    >
      <Group transform={fitbox('contain', src, dst)} layer={paint}>
        <ImageSVG svg={svg} />
      </Group>
    </Canvas>
  )
})
