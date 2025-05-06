import type { TDemoCombatParticipant } from '../combat-participant'
import { CombatParticleModifier } from '@actnone/eldrum-engine/models'
import type { CombatAction, CombatParticleResult } from '@actnone/eldrum-engine/models'
import { DemoAttackCombatAction } from './combat-action'
import type { TDemoCombatAttack } from '../combat-attack'

class Stun extends DemoAttackCombatAction implements CombatAction {
  constructor(participant: TDemoCombatParticipant, combatAttack: TDemoCombatAttack) {
    super(participant, combatAttack)

    this.particleEffects.push(...Stun.particleEffects)
    this.particleModifiers.push(new CombatParticleModifier('damage', 'factor', 1.5))
  }

  static id = 'stun' as const
  static cost = 1000
  static particleEffects = [
    {
      name: 'disoriented' as const,
      condition: (result: CombatParticleResult) => result.hit
    }
  ]

  id = Stun.id
  cost = Stun.cost
}

export default Stun
