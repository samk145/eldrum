import type { TMapPoint, TCoordinates } from '../../../../../models/movement'

import React, { memo } from 'react'
import * as Svg from 'react-native-svg'
import { helpers } from '../../../../../styles'

const AREA_FONT_SIZE = helpers.getSizeValue(18, 16, 14)
const LOCATION_FONT_SIZE = helpers.getSizeValue(16, 14, 12)

type TLabelProps = {
  x: TCoordinates['x']
  y: TCoordinates['y']
} & Pick<TMapPoint, 'label' | 'type'>

export const Label = memo(function Label({ type, label, x, y }: TLabelProps) {
  return (
    <>
      {['location', 'sub-area'].includes(type) && (
        <Svg.Text
          x={x}
          y={y - 25}
          textAnchor="middle"
          fill="white"
          fontFamily="serif-regular"
          fontSize={type === 'sub-area' ? AREA_FONT_SIZE : LOCATION_FONT_SIZE}
        >
          {label}
        </Svg.Text>
      )}

      {type === 'parent-area' && (
        <Svg.Text
          x={x}
          y={y}
          textAnchor="middle"
          fill="gray"
          fontFamily="serif-regular"
          fontSize={AREA_FONT_SIZE}
        >
          {label}
        </Svg.Text>
      )}
    </>
  )
})
