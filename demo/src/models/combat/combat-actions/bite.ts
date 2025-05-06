import { AttackCombatAction } from '@actnone/eldrum-engine/models'
import { DemoAttackCombatAction } from './combat-action'

class Bite extends DemoAttackCombatAction {
  static id = 'bite' as const
  static cost = 1000 as const
  static particleEffects = [
    {
      name: 'bleeding' as const,
      condition: AttackCombatAction.inflictedDamage
    }
  ]

  particleEffects = [...Bite.particleEffects]

  id = Bite.id
  cost = Bite.cost
}

export default Bite
