import type { StatModifier } from '@actnone/eldrum-engine/models'
import { DemoEffect } from './effect'

class Exposed extends DemoEffect {
  static id = 'exposed' as const
  id = Exposed.id
  uses = 1
  statModifiers: StatModifier[] = [
    {
      statName: 'evadeRangedChance',
      type: 'factor',
      value: 0
    },
    {
      statName: 'evadeMeleeChance',
      type: 'factor',
      value: 0
    },
    {
      statName: 'blockChance',
      type: 'factor',
      value: 0
    }
  ]

  preCombatTurn = async () => this.use()

  postCombat = () => this.remove()
}

export default Exposed
