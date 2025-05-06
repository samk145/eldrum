import type { TDemoCombatParticipant } from '../combat-participant'
import type { TDemoCombatAttack } from '../combat-attack'

import { AttackCombatAction } from '@actnone/eldrum-engine/models'
import { DemoAttackCombatAction } from './combat-action'

class Cut extends DemoAttackCombatAction {
  constructor(participant: TDemoCombatParticipant, combatAttack: TDemoCombatAttack) {
    super(participant, combatAttack)

    this.particleEffects.push(...Cut.particleEffects)
  }

  static id = 'cut' as const
  static cost = 1000
  static particleEffects = [
    {
      name: 'bleeding' as const,
      condition: AttackCombatAction.inflictedDamage
    }
  ]

  id = Cut.id
  cost = Cut.cost
}

export default Cut
