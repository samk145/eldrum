import type { TCombatEvent } from '@actnone/eldrum-engine/models'

import React, { useRef, useEffect, memo } from 'react'
import { Animated } from 'react-native'
import { variables } from '@actnone/eldrum-engine/styles'
import style from './generic.style'

const ANIMATION_DURATION = 850

const Generic = ({ event }: { event: TCombatEvent }) => {
  const opacity = useRef(new Animated.Value(1)).current
  const positionY = useRef(new Animated.Value(variables.distance / 2)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        delay: ANIMATION_DURATION,
        useNativeDriver: true
      }),
      Animated.spring(positionY, {
        toValue: 0,
        tension: 5,
        useNativeDriver: true
      })
    ]).start()
  }, [])

  return (
    <Animated.Text
      style={[
        style.event,
        {
          opacity,
          transform: [{ translateY: positionY }]
        }
      ]}
    >
      {event.getLabel()}
    </Animated.Text>
  )
}

export default memo(Generic)
