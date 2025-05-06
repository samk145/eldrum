import type {
  TCombatActionResult,
  TParticleEffectInput,
  CombatParticleResult
} from '@actnone/eldrum-engine/models'
import type { TDemoCombatParticipant } from '../combat-participant'
import { computed } from 'mobx'
import { CombatParticleModifier } from '@actnone/eldrum-engine/models'
import { DemoOffensiveCombatAction } from './combat-action'

class Sweep extends DemoOffensiveCombatAction {
  constructor(participant: TDemoCombatParticipant) {
    super(participant)

    this.particleEffects.push(...Sweep.particleEffects)
    this.particleModifiers.push(new CombatParticleModifier('chanceToBlock', 'set', 0))

    this.tags.add('utility')
  }

  static id = 'sweep' as const
  static cost = 2000
  static particleEffects: TParticleEffectInput[] = [
    {
      name: 'incapacitated',
      condition: result => result.hit
    }
  ]

  id = Sweep.id
  cost = Sweep.cost

  @computed get fulfillsNonAdvantageRequirements() {
    return this.participant.distanceToTarget < 2
  }

  postParticlesFire = async (result: TCombatActionResult) => {
    const breakStance = (particleResult: CombatParticleResult) => {
      if (particleResult.hit) {
        particleResult.target.breakStance()
      }
    }

    result.primaryResults.forEach(breakStance)
  }
}

export default Sweep
