import type {
  TCombatActionResult,
  TParticleEffectInput,
  CombatParticleModifier
} from '@actnone/eldrum-engine/models'
import { AttackCombatAction } from '@actnone/eldrum-engine/models'
import { DemoAttackCombatAction } from './combat-action'
import { type TDemoCombatParticipant } from '../combat-participant'

class Pummel extends DemoAttackCombatAction {
  static id = 'pummel' as const
  static cost = 1500

  id = Pummel.id
  cost = Pummel.cost

  createPrimaryTargetParticles = (
    receiver: TDemoCombatParticipant,
    effects: TParticleEffectInput[] = [],
    modifiers: CombatParticleModifier[] = []
  ) => {
    const { createParticle, particleDamage } = this
    const attackCount = 3

    return Array(attackCount)
      .fill(undefined)
      .map((_, index) =>
        createParticle(receiver, effects, modifiers, particleDamage, {
          timeToImpact: index === 0 ? 0 : 125
        })
      )
  }

  postParticlesFire = async (result: TCombatActionResult) => {
    if (
      result.primaryResults.every(combatParticleResult =>
        AttackCombatAction.inflictedDamage(combatParticleResult)
      )
    ) {
      this.participant.addAdvantagePoints(Pummel.cost)
    }
  }
}

export default Pummel
