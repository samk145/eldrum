import type { TCombatEvent } from '@actnone/eldrum-engine/models'

import React, { memo } from 'react'
import Animated, { Keyframe } from 'react-native-reanimated'
import style from './generic.style'

const ANIMATION_DURATION = 850

const Block = ({ event }: { event: TCombatEvent }) => {
  const enteringAnimation = new Keyframe({
    0: {
      transform: [{ scale: 1 }],
      opacity: 1
    },
    25: {
      transform: [{ scale: 1.5 }],
      opacity: 1
    },
    75: {
      transform: [{ scale: 1.3 }],
      opacity: 1
    },
    100: {
      transform: [{ scale: 1.2 }],
      opacity: 0
    }
  }).duration(ANIMATION_DURATION)

  return (
    <Animated.Text entering={enteringAnimation} style={style.event}>
      {event.getLabel()}
    </Animated.Text>
  )
}

export default memo(Block)
