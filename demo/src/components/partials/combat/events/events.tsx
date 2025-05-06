import type { TCombatParticipant, TCombatEvent } from '@actnone/eldrum-engine/models'

import React from 'react'
import { observer } from 'mobx-react'
import { View } from 'react-native'
import style from './events.style'
import Generic from './generic'
import Reject from './reject'
import Damage from './damage'
import Evade from './evade'
import Block from './block'
import Miss from './miss'

const getEventComponent = (event: TCombatEvent) => {
  switch (event.id) {
    case 'damage':
    case 'bleed':
      return <Damage event={event} />
    case 'evade':
      return <Evade event={event} />
    case 'block':
      return <Block event={event} />
    case 'protected':
    case 'parry':
    case 'immune':
      return <Reject event={event} />
    case 'miss':
      return <Miss event={event} />
    default:
      return <Generic event={event} />
  }
}

const Events = ({ participant }: { participant: TCombatParticipant }) => {
  return (
    <View pointerEvents="none" accessible={false} style={style.wrapper}>
      {participant.events.map(event => (
        <View key={event.uuid} style={style.eventWrapper}>
          {getEventComponent(event)}
        </View>
      ))}
    </View>
  )
}

export default observer(Events)
