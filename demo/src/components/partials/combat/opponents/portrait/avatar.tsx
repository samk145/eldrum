import type { DemoNpcCombatParticipant } from '~demo/models/combat/combat-participant'

import React, { useEffect, useRef, useMemo } from 'react'
import { Image, type SkImage, Group } from '@shopify/react-native-skia'
import {
  interpolate,
  type SharedValue,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming
} from 'react-native-reanimated'
import { observer } from 'mobx-react'

const INACTIVE = 0
const ACTIVE = 1

export type TAvatarProps = {
  width: number
  height: number
  image: SkImage
  corrupted?: boolean
  activeValue: SharedValue<number>
  pulseValue: SharedValue<number>
  participant: DemoNpcCombatParticipant
}

export const Avatar = observer(function Avatar({
  image,
  width,
  height,
  pulseValue,
  activeValue,
  participant
}: TAvatarProps) {
  const { actor } = participant
  const healthValue = useSharedValue(INACTIVE)
  const pulseSkewDirection = useRef(Math.random() > 0.5 ? -1 : 1)
  const groupOrigin = useMemo(() => ({ x: width / 2, y: height }), [width, height])

  const animatedTransforms = useDerivedValue(() => {
    return [
      // Active
      {
        scale: interpolate(activeValue.value, [INACTIVE, ACTIVE], [1, 1.04])
      },
      // Pulse
      {
        scaleY: interpolate(pulseValue.value, [INACTIVE, ACTIVE], [1, 1.01])
      },
      {
        skewX: interpolate(
          pulseValue.value,
          [INACTIVE, ACTIVE],
          [0, pulseSkewDirection.current > 0 ? 0.015 : -0.015]
        )
      },
      // Health
      {
        scale: interpolate(healthValue.value, [INACTIVE, ACTIVE], [1, 0.995])
      }
    ]
  }, [])

  useEffect(() => {
    if (actor.alive && actor.health !== actor.maxHealth) {
      healthValue.value = 1

      healthValue.value = withDelay(
        75,
        withTiming(0, {
          duration: 175
        })
      )
    }
  }, [actor.alive, actor.health])

  return (
    <Group transform={animatedTransforms} origin={groupOrigin}>
      <Image image={image} width={width} height={height} fit="fitWidth" />
    </Group>
  )
})
