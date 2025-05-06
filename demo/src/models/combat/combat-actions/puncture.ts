import { AttackCombatAction, CombatParticleModifier } from '@actnone/eldrum-engine/models'
import { DemoAttackCombatAction } from './combat-action'
import { type TDemoCombatParticipant } from '../combat-participant'
import { type TDemoCombatAttack } from '../combat-attack'

class Puncture extends DemoAttackCombatAction {
  constructor(participant: TDemoCombatParticipant, combatAttack: TDemoCombatAttack) {
    super(participant, combatAttack)

    this.particleModifiers.push(new CombatParticleModifier('damage', 'factor', 1.5))
    this.particleEffects.push(...Puncture.particleEffects)
  }

  static id = 'puncture' as const
  static cost = 1500 as const
  static particleEffects = [
    {
      name: 'sundered' as const,
      condition: AttackCombatAction.inflictedDamage
    }
  ]

  id = Puncture.id
  cost = Puncture.cost
}

export default Puncture
