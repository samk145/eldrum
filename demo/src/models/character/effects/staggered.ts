import type { StatModifier } from '@actnone/eldrum-engine/models'
import { DemoEffect } from './effect'

class Staggered extends DemoEffect {
  static id = 'staggered' as const
  id = Staggered.id
  uses = 1
  stackable = false
  statModifiers: StatModifier[] = [
    {
      statName: 'speed',
      type: 'factor',
      value: 0.75
    }
  ]

  postCombat = () => this.remove()
  preCombatTurn = async () => this.remove()
}

export default Staggered
