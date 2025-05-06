import React, { useEffect } from 'react'
import { View } from 'react-native'
import { Image } from 'expo-image'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withTiming
} from 'react-native-reanimated'
import { observer } from 'mobx-react'
import { useStores } from '@actnone/eldrum-engine/contexts'
import type { CombatTurn } from '@actnone/eldrum-engine/models'
import { Text } from '@actnone/eldrum-engine/components'
import style from './turn.style'

const DIVIDER = 15

const Turn = ({
  turn,
  timestampOverride,
  offset
}: {
  turn: CombatTurn
  timestampOverride?: number
  offset: number
}) => {
  const { content } = useStores()
  const { participant } = turn
  const timestamp = timestampOverride || turn.timestamp
  const positionX = useSharedValue(timestamp)
  const animatedStyles = useAnimatedStyle(() => {
    const translateX = interpolate(positionX.value, [0, 100], [-0, 100 / DIVIDER])

    return {
      transform: [{ translateX }, { translateY: Math.floor(offset) }]
    }
  })
  const portrait =
    'portrait' in participant.actor && participant.actor.portrait
      ? content.getMediaSource('image', participant.actor.portrait)
      : undefined
  const isTargeted = 'isTargeted' in participant ? participant.isTargeted : false

  useEffect(() => {
    positionX.value = withTiming(timestampOverride || turn.timestamp)
  }, [timestamp])

  return (
    <Animated.View
      style={[
        animatedStyles,
        style.wrapper,
        turn.hasPassed && style.wrapperHasPassed,
        turn.isPlayer && style.wrapperIsPlayer,
        isTargeted && !turn.hasPassed && style.wrapperSelected,
        turn.isCurrent && style.wrapperCurrentTurn
      ]}
    >
      {portrait ? (
        <View pointerEvents="none" style={style.portraitWrapper}>
          <Image style={style.portrait} source={portrait} contentFit="contain" />
        </View>
      ) : (
        <Text style={style.name}>{turn.participantNameAbbreviated}</Text>
      )}
    </Animated.View>
  )
}

export default observer(Turn)
