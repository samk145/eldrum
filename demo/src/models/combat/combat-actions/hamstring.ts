import type { TDemoCombatParticipant } from '../combat-participant'
import type { TDemoCombatAttack } from '../combat-attack'

import { CombatParticleModifier } from '@actnone/eldrum-engine/models'
import { DemoAttackCombatAction } from './combat-action'

class Hamstring extends DemoAttackCombatAction {
  constructor(participant: TDemoCombatParticipant, combatAttack: TDemoCombatAttack) {
    super(participant, combatAttack)

    this.particleEffects.push(...Hamstring.particleEffects)

    this.particleModifiers.push(new CombatParticleModifier('damage', 'factor', 1.5))
  }

  static id = 'hamstring' as const
  static cost = 2000
  static particleEffects = [
    {
      name: 'hamstrung' as const,
      condition: DemoAttackCombatAction.inflictedDamage
    }
  ]

  id = Hamstring.id
  cost = Hamstring.cost
}

export default Hamstring
