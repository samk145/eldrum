import type { DemoNpcCombatParticipant } from '~demo/models/combat/combat-participant'
import type { TSurfaceDimensions } from './opponent-wrapper'

import React, { useState } from 'react'
import { type LayoutChangeEvent } from 'react-native'
import Animated, { Easing, FadeIn } from 'react-native-reanimated'
import { observer } from 'mobx-react'
import { useDemoGameStore } from '~demo/hooks'
import style from './opponents.style'
import OpponentWrapper from './opponent-wrapper'

const Opponents = () => {
  const game = useDemoGameStore()
  const [surfaceDimensions, setSurfaceDimensions] = useState<TSurfaceDimensions>()
  const combat = game.combat!
  const opponents = combat.opponents

  const onSelect = (id: string) => {
    if (!combat.player.isOnCooldown) {
      combat.player.selectTargetById(id)
    }
  }

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout

    if (surfaceDimensions?.width !== width || surfaceDimensions?.height !== height) {
      setSurfaceDimensions({ width, height })
    }
  }

  const getPosition = (opponent: DemoNpcCombatParticipant) => {
    const distanceFromPlayer = opponent.row - combat.player.row
    const inFrontOfPlayer = opponent.row > combat.player.row

    let row: number = 0

    if (inFrontOfPlayer && distanceFromPlayer === 1) {
      row = 1
    } else if (inFrontOfPlayer && distanceFromPlayer === 2) {
      row = 2
    } else if (inFrontOfPlayer) {
      row = 3
    }

    const participantsOnSameRow = combat.opponentsGroupedByRow[opponent.row]
    const index = participantsOnSameRow.findIndex(participant => participant === opponent)

    return { row, index, participantsOnSameRow: participantsOnSameRow.length }
  }

  const mappedRow = (row: DemoNpcCombatParticipant[], surfaceDimensions: TSurfaceDimensions) =>
    row.map(participant => (
      <OpponentWrapper
        surfaceDimensions={surfaceDimensions}
        key={participant.id}
        opponent={participant}
        onPress={onSelect}
        position={getPosition(participant)}
      />
    ))

  return (
    <Animated.View
      onLayout={onLayout}
      style={style.wrapper}
      entering={FadeIn.duration(300)
        .easing(Easing.inOut(Easing.quad))
        .delay(opponents.length * 100)}
    >
      {surfaceDimensions && mappedRow(opponents, surfaceDimensions)}
    </Animated.View>
  )
}

export default observer(Opponents)
