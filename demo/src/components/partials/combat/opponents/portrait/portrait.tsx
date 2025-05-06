import type { DemoNpcCombatParticipant } from '~demo/models/combat/combat-participant'

import React, { useEffect, useMemo, useRef } from 'react'
import { observer } from 'mobx-react'
import { Skia, Canvas, Group, useImage } from '@shopify/react-native-skia'
import {
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  Easing
} from 'react-native-reanimated'
import { useStores } from '@actnone/eldrum-engine/contexts'
import { Avatar } from './avatar'
import { Background } from './background'

const INACTIVE = 0
const ACTIVE = 1
const ORIGINAL_IMAGE_WIDTH = 5200
const CLIPPING_PATH =
  'M5200,0 L5200,5200 L2600,5200 C3152.66667,4784.42623 3429,4470.0929 3429,4257 C3429,4230.75956 3429,4186.0929 3429,4123 C3429,4211.81 3322.52,4257 3234.79,4257 C3147.06,4257 1987.77,4257 1928.16,4257 C1868.54,4257 1762,4217.12 1762,4123 C1762,4180.49072 1762,4225.15738 1762,4257 C1762,4464.49072 2041.33333,4778.82405 2600,5200 L0,5200 L0,0 L5200,0 Z'

type TPortraitProps = {
  containerDimensions: { width: number; height: number }
  participant: DemoNpcCombatParticipant
  width: number
  height: number
}

const resizeSvgPath = (path: string, scale: number) => {
  return path.replace(/(-|\+)?(\d+(\.\d+)?)/g, match => (Number(match) * scale).toString())
}

export const Portrait = observer(function Portrait({
  participant,
  containerDimensions,
  width,
  height
}: TPortraitProps) {
  const { actor, isOnCooldown } = participant
  const { content } = useStores()
  const source = participant.actor.portrait
    ? content.getMediaSource('image', participant.actor.portrait)
    : undefined
  const image = useImage(typeof source === 'object' ? source?.uri : source)
  const activeValue = useSharedValue(INACTIVE)
  const pulseValue = useSharedValue(INACTIVE)
  const path = resizeSvgPath(CLIPPING_PATH, width / ORIGINAL_IMAGE_WIDTH)
  const clippingPath = Skia.Path.MakeFromSVGString(path)!
  const canvasDimensions = useMemo(() => ({ width, height }), [width, height])
  const pulseDuration = useRef(participant.behavior.preTurnDelay * 2)

  useEffect(() => {
    const activeOptions = {
      duration: participant.behavior.preTurnDelay,
      easing: Easing.out(Easing.exp)
    }
    const getPulseOptions = (duration: number) => ({
      duration,
      easing: Easing.linear
    })
    if (actor.alive && !isOnCooldown) {
      activeValue.value = withTiming(ACTIVE, activeOptions)
      pulseValue.value = withTiming(1, getPulseOptions(participant.behavior.preTurnDelay / 2))
    } else {
      if (actor.alive && isOnCooldown) {
        pulseValue.value = withRepeat(
          withSequence(
            withTiming(1, getPulseOptions(pulseDuration.current)),
            withTiming(0, getPulseOptions(participant.behavior.preTurnDelay * 2))
          ),
          0,
          true
        )
      } else {
        pulseValue.value = withTiming(1, getPulseOptions(participant.behavior.preTurnDelay))
      }
      activeValue.value = withDelay(150, withTiming(INACTIVE, activeOptions))
    }
  }, [isOnCooldown, actor.alive, pulseDuration.current])

  return (
    <Canvas style={{ width, height }}>
      <Background
        containerDimensions={containerDimensions}
        canvasDimensions={canvasDimensions}
        activeValue={activeValue}
      />
      {image && width > 0 && height > 0 && (
        <Group clip={clippingPath}>
          <Avatar
            image={image}
            width={width}
            height={height}
            participant={participant}
            activeValue={activeValue}
            pulseValue={pulseValue}
          />
        </Group>
      )}
    </Canvas>
  )
})
