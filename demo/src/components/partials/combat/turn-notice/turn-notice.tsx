import React, { useRef, useEffect } from 'react'
import { Animated } from 'react-native'
import { observer } from 'mobx-react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '@actnone/eldrum-engine/contexts'
import { Card, Text } from '@actnone/eldrum-engine/components'
import { dimensions, variables } from '@actnone/eldrum-engine/styles'
import style from './turn-notice.style'

const POSITION_X_START = -dimensions.width
const POSITION_X_END = dimensions.width

function AnimationOptions(toValue: number) {
  return {
    toValue,
    useNativeDriver: true
  }
}

const TurnNotice = () => {
  const { t } = useTranslation()
  const game = useGameStore()
  const combat = game.combat!

  const opacity = useRef(new Animated.Value(0)).current
  const positionX = useRef(new Animated.Value(POSITION_X_START)).current

  const animationSequence = Animated.sequence([
    Animated.parallel([
      Animated.spring(opacity, AnimationOptions(1)),
      Animated.spring(positionX, AnimationOptions(0))
    ]),
    Animated.parallel([
      Animated.spring(positionX, AnimationOptions(POSITION_X_END)),
      Animated.spring(opacity, AnimationOptions(0))
    ])
  ])

  useEffect(() => {
    if (!combat.player.isOnCooldown) {
      positionX.setValue(POSITION_X_START)
      animationSequence.reset()
      animationSequence.start()
    }
  }, [combat.currentTurn])

  return (
    <Animated.View pointerEvents="none" style={[style.wrapper, { opacity }]}>
      <Animated.View style={{ transform: [{ translateX: positionX }] }}>
        <Card style={style.innerCard} corners="all" cornerSize={variables.distance * 2}>
          <Text style={style.text}>{t('COMBAT-TURNS-YOUR_TURN-LABEL')}</Text>
        </Card>
      </Animated.View>
    </Animated.View>
  )
}

export default observer(TurnNotice)
