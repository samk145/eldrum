import React, { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  FadeIn,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated'
import { A11y } from 'react-native-a11y-order'
import { observer } from 'mobx-react'
import { useTranslation } from 'react-i18next'
import { useDemoGameStore } from '~demo/hooks'
import { useScreenReaderInfo } from '@actnone/eldrum-engine/hooks'
import { ProgressBar, ActionPoints } from '@actnone/eldrum-engine/components'
import { CombatEffectList } from '~demo/components/units'
import { variables, helpers } from '@actnone/eldrum-engine/styles'
import Hands from './hands/hands'
import BottomBar from './bottom-bar/bottom-bar'
import Events from '../events/events'
import style from './player.style'

const { colors } = variables

const BAR_HEIGHT = helpers.getSizeValue(14, 10, 10, 10, 10, 8)
const ACTION_POINT_DIAMETER = helpers.getSizeValue(20, 16, 12)

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 250,
  mass: 0.8
}

const Player = () => {
  const { t } = useTranslation()
  const game = useDemoGameStore()
  const combat = game.combat!
  const screenReaderEnabled = useScreenReaderInfo()
  const positionY = useSharedValue(0)

  const { player } = combat

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ translateY: positionY.value }] }
  }, [])

  useEffect(() => {
    if (player.isOnCooldown || !combat.opponentsAreAlive) {
      positionY.value = withSpring(500, SPRING_CONFIG)
    } else {
      positionY.value = withSpring(0, SPRING_CONFIG)
    }
  }, [player.isOnCooldown, combat.opponentsAreAlive])

  return (
    <Animated.View
      style={style.wrapper}
      accessibilityState={{ disabled: player.isOnCooldown }}
      entering={FadeIn.duration(300).easing(Easing.inOut(Easing.quad)).delay(500)}
    >
      <A11y.Order style={style.stats}>
        {!screenReaderEnabled && (
          <View style={style.eventsWrapper} pointerEvents="none">
            <Events participant={player} />
          </View>
        )}

        <A11y.Index index={1} style={style.actionPoints}>
          <ActionPoints
            accessible
            accessibilityLabel={t('COMBAT-PLAYER-ACTION_POINTS-A11Y_LABEL', {
              actionPoints: player.actionPoints,
              maxActionPoints: player.maxActionPoints
            })}
            align="center"
            dotDiameter={ACTION_POINT_DIAMETER}
            current={player.actionPoints}
            max={player.maxActionPoints}
          />
        </A11y.Index>
        <View style={style.statsLower}>
          <View pointerEvents="box-none" style={style.bars}>
            <A11y.Index index={2}>
              <ProgressBar
                height={BAR_HEIGHT}
                accessibilityLabel={`${t('COMBAT-PLAYER-HEALTH_POINTS-A11Y_LABEL')}:`}
                color={colors.lowHealth}
                value={player.actor.health}
                maxValue={player.actor.maxHealth}
                showValuesOnPress
                valuesLabel={t('CHARACTER-DERIVATIVE-HEALTH_POINTS-ACRO')}
                valueStyles={style.barValueStyle}
                screenReaderEnabled={screenReaderEnabled}
              />
            </A11y.Index>
            <A11y.Index index={4} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
              <CombatEffectList effects={player.actor.effects.list} />
            </A11y.Index>
            <A11y.Index index={3}>
              <ProgressBar
                height={BAR_HEIGHT}
                accessibilityLabel={`${t('COMBAT-PLAYER-ADVANTAGE_POINTS-A11Y_LABEL')}:`}
                color={colors.teal}
                value={player.advantagePoints}
                maxValue={player.maxAdvantagePoints}
                valueStyles={style.barValueStyle}
                showValuesOnPress
                valuesLabel={t('COMBAT-ADVANTAGE_POINTS-LABEL')}
                screenReaderEnabled={screenReaderEnabled}
              />
            </A11y.Index>
          </View>
        </View>
      </A11y.Order>
      <Animated.View style={animatedStyle}>
        <View style={style.combatAttackSets}>
          <Hands player={player} />
        </View>
        <BottomBar player={player} />
      </Animated.View>
    </Animated.View>
  )
}

export default observer(Player)
