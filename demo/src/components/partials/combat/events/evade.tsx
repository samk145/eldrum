import type { TCombatEvent } from '@actnone/eldrum-engine/models'

import React, { memo } from 'react'
import Animated, { Keyframe, Easing } from 'react-native-reanimated'
import { variables } from '@actnone/eldrum-engine/styles'
import style from './generic.style'

const ANIMATION_DURATION = 850

const Evade = ({ event }: { event: TCombatEvent }) => {
  const enteringAnimation = new Keyframe({
    0: {
      transform: [{ translateX: 0 }],
      opacity: 1,
      easing: Easing.out(Easing.exp)
    },
    75: {
      opacity: 1
    },
    100: {
      transform: [{ translateX: variables.distance * 2 }],
      opacity: 0
    }
  }).duration(ANIMATION_DURATION)

  return (
    <Animated.Text entering={enteringAnimation} style={style.event}>
      {event.getLabel()}
    </Animated.Text>
  )
}

export default memo(Evade)
