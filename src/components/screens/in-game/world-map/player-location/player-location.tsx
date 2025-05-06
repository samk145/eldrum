import type { TMapMode } from '../../../../../models/puppeteer'

import React, { memo } from 'react'
import { Animated } from 'react-native'
import * as Svg from 'react-native-svg'
import { variables } from '../../../../../styles'

const AnimatedCircle = Animated.createAnimatedComponent(Svg.Circle)

type TPlayerLocationProps = {
  coordinates: Animated.ValueXY
  mode: TMapMode
}

const PlayerLocation = ({ coordinates, mode }: TPlayerLocationProps) => {
  return (
    <AnimatedCircle
      r={15}
      cx={coordinates.x}
      cy={coordinates.y}
      fill={mode === 'maximized' ? variables.colors.azure : 'black'}
      fillOpacity={0.6}
    />
  )
}

export default memo(PlayerLocation)
