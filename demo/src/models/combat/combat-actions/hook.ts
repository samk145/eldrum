import type { CombatParticleResult } from '@actnone/eldrum-engine/models'
import type { TDemoCombatParticipant } from '../combat-participant'

import { computed } from 'mobx'
import { DemoOffensiveCombatAction } from './combat-action'

class Hook extends DemoOffensiveCombatAction {
  constructor(participant: TDemoCombatParticipant) {
    super(participant)

    this.particleEffects.push(...Hook.particleEffects)
    this.particleModifiers.push(
      {
        property: 'chanceToBlock',
        type: 'set',
        value: 0
      },
      {
        property: 'chanceToEvade',
        type: 'set',
        value: 0
      },
      {
        property: 'chanceToHit',
        type: 'term',
        value: 1
      }
    )

    this.tags.add('utility')
  }

  static id = 'hook' as const
  static cost = 0
  static particleEffects = [
    {
      name: 'exposed' as const,
      condition: (result: CombatParticleResult) => result.hit
    }
  ]

  id = Hook.id
  cost = Hook.cost

  @computed get fulfillsNonAdvantageRequirements() {
    return this.participant.target.actor.blockChance > 0 && this.participant.distanceToTarget < 2
  }
}

export default Hook
