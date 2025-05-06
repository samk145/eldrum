import { type TCombatParticipant, type CombatTurn } from '@actnone/eldrum-engine/models'

import React from 'react'
import Turn from './turn'
import { observer } from 'mobx-react'

const UPCOMING_TURNS_EXTRAPOLATION = 5

export const Timeline = observer(
  ({ participant, offset }: { participant: TCombatParticipant; offset: number }) => {
    const { turns } = participant

    return (
      <React.Fragment>
        {turns.map(turn => (
          <Turn key={turn.id} turn={turn} offset={offset} />
        ))}
        {participant.isAlive &&
          !participant.hasReachedHealthLimit &&
          new Array(UPCOMING_TURNS_EXTRAPOLATION)
            .fill(turns[turns.length - 1])
            .map((turn: CombatTurn, index) => {
              return (
                <Turn
                  key={`${turn.id}-${index}`}
                  turn={turn}
                  offset={offset}
                  timestampOverride={turn.timestamp + (index + 1) * participant.turnInterval}
                />
              )
            })}
      </React.Fragment>
    )
  }
)
