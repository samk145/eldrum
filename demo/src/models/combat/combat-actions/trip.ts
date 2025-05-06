import type { TCombatActionResult } from '@actnone/eldrum-engine/models'
import { computed } from 'mobx'
import { CombatParticleModifier } from '@actnone/eldrum-engine/models'
import { DemoOffensiveCombatAction } from './combat-action'
import type { TDemoCombatParticipant } from '../combat-participant'

class Trip extends DemoOffensiveCombatAction {
  constructor(participant: TDemoCombatParticipant) {
    super(participant)

    this.particleModifiers.push(new CombatParticleModifier('chanceToBlock', 'set', 0))
  }

  static id = 'trip' as const
  static cost = 500

  id = Trip.id
  cost = Trip.cost

  @computed get fulfillsNonAdvantageRequirements() {
    return this.participant.distanceToTarget < 2
  }

  postParticlesFire = async (result: TCombatActionResult) => {
    if (result.primaryResults[0].hit) {
      this.participant.target.breakStance()
    }
  }
}

export default Trip
