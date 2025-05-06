import type { DemoPlayerCombatParticipant } from '~demo/models/combat/combat-participant'
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { observer } from 'mobx-react'
import { Card } from '@actnone/eldrum-engine/components'
import { variables } from '@actnone/eldrum-engine/styles'

import HandActions from './hand-actions'
import { BUTTON_SIZE } from './attack-button.style'

const { distance } = variables

interface IHandsProps {
  player: DemoPlayerCombatParticipant
}

const Hands: React.FC<IHandsProps> = ({ player }) => {
  return (
    <View style={handsStyles.wrapper}>
      <Card
        corners="all"
        cardOpacity={0.35}
        cornerSize={handStyles.wrapper.borderRadius}
        tint={variables.colors.nightShade}
        style={handStyles.wrapper}
      >
        <HandActions combatAttackSet={player.combatAttackSets[0]} />
      </Card>
    </View>
  )
}

const handsStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'center'
  }
})

const handStyles = StyleSheet.create({
  wrapper: {
    borderRadius: distance * 2,
    height: BUTTON_SIZE + distance * 2,
    width: '100%',
    justifyContent: 'center'
  }
})

export default observer(Hands)
