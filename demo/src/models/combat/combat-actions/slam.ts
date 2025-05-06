import { CombatParticleModifier, AttackCombatAction } from '@actnone/eldrum-engine/models'
import { DemoAttackCombatAction } from './combat-action'
import { type TDemoCombatParticipant } from '../combat-participant'
import { type TDemoCombatAttack } from '../combat-attack'

class Slam extends DemoAttackCombatAction {
  constructor(participant: TDemoCombatParticipant, combatAttack: TDemoCombatAttack) {
    super(participant, combatAttack)

    this.particleEffects.push(...Slam.particleEffects)
    this.particleModifiers.push(
      new CombatParticleModifier('damage', 'factor', 2.5),
      new CombatParticleModifier('chanceToBlock', 'set', 0)
    )
  }

  static id = 'slam' as const
  static cost = 3000
  static particleEffects = [
    {
      name: 'staggered' as const,
      condition: AttackCombatAction.inflictedDamage
    }
  ]

  id = Slam.id
  cost = Slam.cost
}

export default Slam
