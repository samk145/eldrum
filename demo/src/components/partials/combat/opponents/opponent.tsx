import type { DemoNpcCombatParticipant } from '~demo/models/combat/combat-participant'

import React, { useCallback, useState, useMemo } from 'react'
import { type LayoutChangeEvent, View, type ViewProps } from 'react-native'
import { observer } from 'mobx-react'
import { Text, ProgressBar, ActionPoints } from '@actnone/eldrum-engine/components'
import { CombatEffectList, Protection } from '~demo/components/units'
import { useScreenReaderInfo } from '@actnone/eldrum-engine/hooks'
import { variables, helpers } from '@actnone/eldrum-engine/styles'
import Events from '../events/events'
import { Portrait } from './portrait/portrait'
import style from './opponent.style'

const { colors } = variables

const BAR_HEIGHT = helpers.getSizeValue(10, 6)
const ACTION_POINT_DIAMETER = helpers.getSizeValue(12, 8)
const WIDTH_TO_HEIGHT_RATIO = 1.705

type TOpponentProps = {
  participant: DemoNpcCombatParticipant
} & ViewProps

const Opponent = ({ participant, ...rest }: TOpponentProps) => {
  const screenReaderEnabled = useScreenReaderInfo()
  const [containerWidth, setContainerWidth] = useState<number>()
  const { actor } = participant
  const portraitSize = containerWidth ? containerWidth * 3 : undefined
  const containerHeight = containerWidth ? containerWidth * WIDTH_TO_HEIGHT_RATIO : undefined

  const containerDimensions = useMemo(() => {
    return containerWidth && containerHeight
      ? { width: containerWidth, height: containerHeight }
      : undefined
  }, [containerWidth, containerHeight])

  const handleLayoutChange = useCallback(({ nativeEvent }: LayoutChangeEvent) => {
    const { width } = nativeEvent.layout

    setContainerWidth(width)
  }, [])

  return (
    <View
      style={[style.boxWrapper, !actor.alive && style.boxWrapperDead]}
      onLayout={handleLayoutChange}
      {...rest}
    >
      <View pointerEvents="none" style={style.headlineWrapper}>
        <Text style={style.headline}>{actor.name}</Text>
      </View>
      <View style={[style.mainContainer, { height: containerHeight }]}>
        {actor.portrait && !screenReaderEnabled && portraitSize && (
          <View
            pointerEvents="none"
            style={[
              style.portraitWrapper,
              {
                width: portraitSize,
                height: portraitSize,
                top: -portraitSize / 4,
                left: -portraitSize / 3
              }
            ]}
          >
            {containerDimensions && (
              <Portrait
                width={portraitSize}
                height={portraitSize}
                participant={participant}
                containerDimensions={containerDimensions}
              />
            )}
          </View>
        )}
        {actor.alive && (
          <React.Fragment>
            <View style={style.actionPointsWrapper}>
              <ActionPoints
                dotDiameter={ACTION_POINT_DIAMETER}
                current={participant.actionPoints}
                max={participant.maxActionPoints}
                align="center"
              />
            </View>
            <View style={style.healthBar}>
              <ProgressBar
                height={BAR_HEIGHT}
                color={colors.lowHealth}
                value={actor.health}
                maxValue={actor.maxHealth}
              />
              <CombatEffectList effects={actor.effects.list} small />
            </View>
            <View style={style.advantageMeter}>
              <ProgressBar
                height={BAR_HEIGHT}
                color={colors.teal}
                value={participant.advantagePoints}
                maxValue={participant.maxAdvantagePoints}
              />
            </View>
          </React.Fragment>
        )}
      </View>
      {!screenReaderEnabled && participant.protection > 0 && (
        <View style={style.protectionWrapper}>
          <Protection participant={participant} />
        </View>
      )}
      <View style={style.eventsWrapper}>
        <Events participant={participant} />
      </View>
    </View>
  )
}

export default observer(Opponent)
