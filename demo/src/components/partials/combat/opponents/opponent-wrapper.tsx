import { type TFunction } from 'i18next'
import type { DemoNpcCombatParticipant } from '~demo/models/combat/combat-participant'
import { observer } from 'mobx-react'
import React, { useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Animated, Easing } from 'react-native'
import { dimensions, variables } from '@actnone/eldrum-engine/styles'
import { NpcCombatParticipant } from '@actnone/eldrum-engine/models'
import Opponent from './opponent'
import style from './opponent-wrapper.style'

export type TSurfaceDimensions = { width: number; height: number }

const getAccessibilityLabel = (
  participant: DemoNpcCombatParticipant,
  t: TFunction<'translation', undefined>
) => {
  const { actor } = participant

  let label: string = participant.isAlive
    ? `${participant.name}.`
    : `${participant.name} (${'COMBAT-OPPONENT-A11Y_LABEL-DEFEATED'}).`

  if (participant.isAlive) {
    if (participant.isTargeted) {
      label += `, ${t('SELECTED_LABEL')}.`
    }

    label += `\n${t('COMBAT-OPPONENT-A11Y_LABEL-DISTANCE', { number: participant.distanceToTarget })}.`
    label += `\n${t('CHARACTER-DERIVATIVE-HEALTH_POINTS-SHORT')}: ${actor.health} of ${actor.maxHealth}.`
    label += `\n${t('CHARACTER-DERIVATIVE-PROTECTION')}: ${actor.protection}.`
    label += `\n${t('COMBAT-ACTION_POINTS-LABEL')}: ${participant.maxActionPoints}.`
    label += `\n${t('COMBAT-ADVANTAGE_POINTS-LABEL')}: ${t('VALUE-X_OF_Y-LABEL', { value: participant.advantagePoints, total: participant.maxAdvantagePoints })}.`

    label += `\n${t('EFFECTS-LABEL')}: ${
      actor.effects.list.length
        ? actor.effects.list.map(effect => effect.id).join()
        : t('NONE-LABEL')
    }`
  }

  return label
}

const sizeInterpolationOption = {
  inputRange: [0, 1, 2, 3],
  outputRange: [1.2, 1, 0.75, 0.3]
}

function isEven(num: number) {
  return !(num % 2)
}

/**
 * Calculate Column Position
 *
 * This function handles the extrapolation and interpolation of the participant's
 * position on the X plane (i.e. column). A regular React.Animated interpolation
 * option is not able to handle this, as we need to change the output values
 * depending on the number of participants on the row, as well as whether they
 * are in an even or odd number. This basically makes sure to always center
 * all participants on the row.
 */
const calculateColumnPosition = (
  participantsOnRow: number,
  index: number,
  surfaceWidth: number = dimensions.width
) => {
  const range = participantsOnRow > 1 ? participantsOnRow : 2
  const evenNumberOfParticipants = isEven(participantsOnRow)
  const distanceBetweenParticipantCenter =
    (surfaceWidth - variables.distance * 2) / participantsOnRow
  const centerAndRightSide = new Array(Math.ceil(range / 2)).fill('')
  const leftSide = new Array(Math.floor(range / 2)).fill('')

  if (evenNumberOfParticipants) {
    return centerAndRightSide.concat(leftSide).map((_, index) => {
      const distance = distanceBetweenParticipantCenter / 2

      if (isEven(index + 1)) {
        return -distance * index
      } else {
        return distance * (index + 1)
      }
    })[index]
  } else {
    return centerAndRightSide
      .map((_, index) => distanceBetweenParticipantCenter * index)
      .concat(leftSide.map((_, index) => -distanceBetweenParticipantCenter * (index + 1)))[index]
  }
}

type TOpponentWrapperProps = {
  surfaceDimensions: TSurfaceDimensions
  opponent: DemoNpcCombatParticipant
  onPress: (id: string) => void
  position: {
    row: number
    index: number
    participantsOnSameRow: number
  }
}

const OpponentWrapper = ({
  opponent,
  position,
  onPress,
  surfaceDimensions
}: TOpponentWrapperProps) => {
  const { t } = useTranslation()
  const animatedPosition = useRef(
    new Animated.ValueXY({
      x: calculateColumnPosition(
        position.participantsOnSameRow,
        position.index,
        surfaceDimensions.width
      ),
      y: position.row
    })
  ).current

  const distanceInterpolationOption = {
    inputRange: [0, 1, 2, 3],
    outputRange: [
      dimensions.height,
      0,
      -surfaceDimensions.height / 3,
      -surfaceDimensions.height / 2
    ]
  }

  useEffect(() => {
    Animated.timing(animatedPosition, {
      duration: NpcCombatParticipant.movementAnimationDuration,
      delay: NpcCombatParticipant.movementAnimationDelay,
      toValue: {
        x: calculateColumnPosition(
          position.participantsOnSameRow,
          position.index,
          surfaceDimensions.width
        ),
        y: position.row
      },
      easing: Easing.out(Easing.sin),
      useNativeDriver: true
    }).start()
  }, [position])

  const accessibilityLabel = getAccessibilityLabel(opponent, t)
  const handleOnPress = useCallback(() => onPress(opponent.id), [opponent])

  return (
    <Animated.View
      style={[
        style.wrapper,
        {
          transform: [
            { translateX: animatedPosition.x },
            { translateY: animatedPosition.y.interpolate(distanceInterpolationOption) },
            { scale: animatedPosition.y.interpolate(sizeInterpolationOption) }
          ]
        },
        position.row === 1 && style.wrapperFrontRow,
        position.row === 3 && style.wrapperThirdRow,
        !opponent.isOnCooldown && style.wrapperActive,
        opponent.isTargeted && style.wrapperSelected
      ]}
    >
      <Pressable
        accessible
        accessibilityLabel={accessibilityLabel}
        disabled={!opponent.isAlive}
        onPress={handleOnPress}
      >
        <Opponent participant={opponent} />
      </Pressable>
    </Animated.View>
  )
}

export default observer(OpponentWrapper)
