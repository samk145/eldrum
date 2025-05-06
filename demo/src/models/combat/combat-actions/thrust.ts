import { CombatParticleModifier } from '@actnone/eldrum-engine/models'
import { DemoAttackCombatAction } from './combat-action'
import { type TDemoCombatParticipant } from '../combat-participant'
import { type TDemoCombatAttack } from '../combat-attack'

class Thrust extends DemoAttackCombatAction {
  constructor(participant: TDemoCombatParticipant, combatAttack: TDemoCombatAttack) {
    super(participant, combatAttack)

    this.particleModifiers.push(new CombatParticleModifier('damage', 'factor', 2))
  }

  static id = 'thrust' as const
  static cost = 2000
  id = Thrust.id
  cost = Thrust.cost
}

export default Thrust
