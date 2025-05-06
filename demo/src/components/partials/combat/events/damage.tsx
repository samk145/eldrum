import type { DamageEvent, BleedEvent } from '@actnone/eldrum-engine/models'

import React, { memo } from 'react'
import Animated, { Keyframe, Easing } from 'react-native-reanimated'
import { variables } from '@actnone/eldrum-engine/styles'
import style from './damage.style'

const getDuration = (duration: number, isCritical: boolean | null) =>
  isCritical ? duration * 1.25 : duration

enum XDirection {
  Right,
  Left
}

const DEFAULT_FROM_SCALE = 1.5
const CRITICAL_FROM_SCALE = 2
const INITIAL_DIRECTION_OFFSET = variables.distance / 12.5
const ANIMATION_DURATION = 850

const Damage = ({ event }: { event: DamageEvent | BleedEvent }) => {
  const xDirection: XDirection = Math.random() > 0.5 ? 1 : 0
  const xOffsetTop = Math.max((Math.random() * variables.distance) / 3, variables.distance / 16)
  const xOffsetBottom = xOffsetTop * 3

  const enteringAnimation = new Keyframe({
    0: {
      transform: [
        { translateX: 0 },
        { translateY: 0 },
        { scale: 'critical' in event && event.critical ? CRITICAL_FROM_SCALE : DEFAULT_FROM_SCALE }
      ],
      opacity: 1
    },
    10: {
      transform: [
        {
          translateX: 0
        },
        { translateY: -INITIAL_DIRECTION_OFFSET * 2 },
        { scale: 1 }
      ],
      opacity: 1,
      easing: Easing.linear
    },
    60: {
      transform: [
        { translateX: xDirection === XDirection.Right ? xOffsetTop : -xOffsetTop },
        { translateY: -variables.distance },
        { scale: 1 }
      ],
      opacity: 0.9,
      easing: Easing.out(Easing.quad)
    },
    75: {
      transform: [
        { translateX: xDirection === XDirection.Right ? xOffsetTop + 1 : -(xOffsetTop + 1) },
        { translateY: -variables.distance }
      ],
      opacity: 0.9
    },
    100: {
      transform: [
        { translateX: xDirection === XDirection.Right ? xOffsetBottom + 2 : -(xOffsetBottom + 2) },
        { translateY: -variables.distance / 2 },
        { scale: 0.7 }
      ],
      opacity: 0,
      easing: Easing.in(Easing.quad)
    }
  }).duration(getDuration(ANIMATION_DURATION, 'critical' in event && event.critical))

  return (
    <Animated.Text
      entering={enteringAnimation}
      style={[style.event, 'critical' in event && event.critical ? style.critical : undefined]}
    >
      {event.getLabel()}
    </Animated.Text>
  )
}

export default memo(Damage)
