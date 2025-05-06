import type { TCombatEvent } from '@actnone/eldrum-engine/models'

import React, { memo } from 'react'
import Animated, { Keyframe, Easing } from 'react-native-reanimated'
import style from './generic.style'

const Reject = ({ event }: { event: TCombatEvent }) => {
  const offset = 2.5
  const easing = Easing.ease

  const ANIMATION_DURATION = 850

  const enteringAnimation = new Keyframe({
    0: {
      transform: [{ translateX: -offset }],
      opacity: 1,
      easing
    },
    20: {
      transform: [{ translateX: offset }],
      easing
    },
    40: {
      transform: [{ translateX: -offset }],
      easing
    },
    60: {
      transform: [{ translateX: offset }],
      easing
    },
    80: {
      transform: [{ translateX: -offset }],
      opacity: 1,
      easing
    },
    100: {
      transform: [{ translateX: 0 }],
      opacity: 0,
      easing
    }
  }).duration(ANIMATION_DURATION)

  return (
    <Animated.Text entering={enteringAnimation} style={style.event}>
      {event.getLabel()}
    </Animated.Text>
  )
}

export default memo(Reject)
