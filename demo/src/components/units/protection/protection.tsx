import type { TCombatParticipant } from '@actnone/eldrum-engine/models'

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  withTiming,
  type EntryAnimationsValues,
  type ExitAnimationsValues
} from 'react-native-reanimated'
import { observer } from 'mobx-react'
import { Text, Icon } from '@actnone/eldrum-engine/components'
import { variables, helpers } from '@actnone/eldrum-engine/styles'

const AnimatedText = Animated.createAnimatedComponent(Text)

const { colors, fonts, distance } = variables

export const containerSize = helpers.getSizeValue(distance * 1.5, distance * 1.5, distance * 1.25)

const valueFontSize = helpers.getSizeValue(fonts.body - 8, fonts.body - 12, fonts.body - 8)
const animationDistance = valueFontSize
const animationDuration = 300

const entering = (values: EntryAnimationsValues) => {
  'worklet'
  const animations = {
    originY: withTiming(values.targetOriginY, {
      duration: animationDuration
    }),
    opacity: withTiming(1, { duration: animationDuration })
  }
  const initialValues = {
    originY: values.targetOriginY - animationDistance,
    opacity: 0
  }
  return {
    initialValues,
    animations
  }
}

const exiting = (values: ExitAnimationsValues) => {
  'worklet'
  const animations = {
    originY: withTiming(values.currentOriginY + animationDistance, {
      duration: animationDuration
    }),
    opacity: withTiming(0, { duration: animationDuration })
  }
  const initialValues = {
    originY: values.currentOriginY,
    opacity: 1
  }
  return {
    initialValues,
    animations
  }
}

export const Protection = observer(function ({ participant }: { participant: TCombatParticipant }) {
  const { protection } = participant.actor.stats

  return (
    <View style={style.container}>
      <View style={style.icon}>
        <Icon
          name="protection"
          fill={variables.colors.nightShade}
          height={style.container.height}
          width={style.container.width}
        />
      </View>
      <AnimatedText
        key={protection.value}
        entering={entering}
        exiting={exiting}
        style={style.value}
      >
        {Math.ceil(protection.value)}
      </AnimatedText>
    </View>
  )
})

const style = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: containerSize,
    height: containerSize,
    overflow: 'hidden'
  },
  icon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  value: {
    width: '150%',
    textAlign: 'center',
    color: colors.white,
    fontFamily: fonts.demi,
    marginTop: helpers.getSizeValue(-4, -2),
    fontSize: valueFontSize,
    zIndex: 2
  }
})
