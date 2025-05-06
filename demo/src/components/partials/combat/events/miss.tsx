import type { TCombatEvent } from '@actnone/eldrum-engine/models'

import React, { memo } from 'react'
import Animated, { Keyframe, Easing } from 'react-native-reanimated'
import { variables } from '@actnone/eldrum-engine/styles'
import style from './generic.style'

const { distance } = variables

enum XDirection {
  Right,
  Left
}

const ANIMATION_DURATION = 850

const Miss = ({ event }: { event: TCombatEvent }) => {
  const xDirection: XDirection = Math.random() > 0.5 ? 1 : 0

  const enteringAnimation = new Keyframe({
    0: {
      transform: [{ scale: 1.25 }, { translateY: 0 }, { translateX: 0 }, { rotate: '0deg' }],
      opacity: 1,
      easing: Easing.out(Easing.exp)
    },
    50: {
      opacity: 1
    },
    100: {
      transform: [
        { scale: 0.5 },
        { translateY: -(variables.distance * 3) },
        { translateX: XDirection ? distance / 10 : -(distance / 10) },
        { rotate: xDirection ? '10deg' : '-10deg' }
      ],
      opacity: 0
    }
  }).duration(ANIMATION_DURATION)

  return (
    <Animated.Text entering={enteringAnimation} style={style.event}>
      {event.getLabel()}
    </Animated.Text>
  )
}

export default memo(Miss)
