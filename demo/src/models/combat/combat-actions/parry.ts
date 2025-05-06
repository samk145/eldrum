import { DemoDefensiveCombatAction } from './combat-action'

class Parry extends DemoDefensiveCombatAction {
  static id = 'parry' as const
  static cost = 0
  static effects = [Parry.id]
  id = Parry.id
  cost = Parry.cost
  effects = Parry.effects
  tags = new Set(['defensive', 'utility'])
}

export default Parry
