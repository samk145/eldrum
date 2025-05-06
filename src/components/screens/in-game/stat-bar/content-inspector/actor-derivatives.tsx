import type { TActor } from '../../../../../models/character/t-actor'
import React from 'react'
import { Fieldset } from '../../../../units'

const ActorDerivatives = ({ actor }: { actor: TActor }) => {
  return (
    <Fieldset
      legend="Derivatives"
      fields={Object.entries(actor.stats).map(([key, stat]) => {
        return {
          label: key,
          value: key.includes('Chance') ? `${(stat.value * 100).toFixed()}%` : stat.value.toFixed(2)
        }
      })}
    />
  )
}

export default ActorDerivatives
