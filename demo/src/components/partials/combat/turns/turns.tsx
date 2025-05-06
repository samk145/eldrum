import React from 'react'
import { View, Animated } from 'react-native'
import { useTranslation } from 'react-i18next'
import ReAnimated, { FadeInRight } from 'react-native-reanimated'
import { observer } from 'mobx-react'
import { useGameStore } from '@actnone/eldrum-engine/contexts'
import { useScreenReaderInfo } from '@actnone/eldrum-engine/hooks'
import { Text } from '@actnone/eldrum-engine/components'
import style from './turns.style'
import turnStyle from './turn.style'
import { Timeline } from './timeline'

const DIVIDER = 15

const timelineInterpolationOptions = {
  inputRange: [0, 100],
  outputRange: [-0, -(100 / DIVIDER)]
}

type TAccessibilityWrapperProps = {
  children: React.ReactNode
}

const AccessibilityWrapper = observer(({ children }: TAccessibilityWrapperProps) => {
  const game = useGameStore()
  const combat = game.combat!

  const turnsLabel =
    'Turns' +
    (combat.currentTurn
      ? `\nCurrent turnholder: ${
          combat.currentTurn?.participantName
        }, \nUpcoming: ${combat.upcomingTurns.map(turn => turn.participantName).join()}`
      : '')

  return (
    <View
      accessible={!combat.player.isOnCooldown && combat.turns.length > 0}
      accessibilityLabel={turnsLabel}
      importantForAccessibility={combat.player.isOnCooldown ? 'no-hide-descendants' : 'auto'}
    />
  )
})

const TimeLines = observer(() => {
  const { t } = useTranslation()
  const game = useGameStore()
  const combat = game.combat!

  const timelines = combat.participants.map((participant, index) => (
    <Timeline
      key={index}
      participant={participant}
      offset={index * (turnStyle.wrapper.height / 3)}
    />
  ))

  return (
    <ReAnimated.View entering={FadeInRight.duration(300).delay(750)}>
      <Text style={style.headline}>{t('COMBAT-TURN_TIMELINE-LABEL')}</Text>
      <Animated.View
        style={[
          style.turnsWrapper,
          {
            transform: [
              {
                translateX: combat.timelinePosition.interpolate(timelineInterpolationOptions)
              }
            ]
          }
        ]}
      >
        {timelines}
      </Animated.View>
    </ReAnimated.View>
  )
})

const Turns = () => {
  const screenReaderEnabled = useScreenReaderInfo()

  return screenReaderEnabled ? (
    <AccessibilityWrapper>
      <TimeLines />
    </AccessibilityWrapper>
  ) : (
    <TimeLines />
  )
}

export default observer(Turns)
