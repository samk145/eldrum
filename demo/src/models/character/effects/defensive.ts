import type { StatModifier } from '@actnone/eldrum-engine/models'
import { DemoEffect } from './effect'

class Defensive extends DemoEffect {
  static id = 'defensive' as const
  id = Defensive.id
  uses = 3
  extendable = true
  isStance = true
  immunities = ['incapacitated' as const, 'staggered' as const]
  statModifiers: StatModifier[] = [
    {
      statName: 'blockChance',
      type: 'factor',
      value: 1.5
    },
    {
      statName: 'protection',
      type: 'factor',
      value: 1.5
    }
  ]

  preCombatTurn = async () => this.use()

  postCombat = () => this.remove()
}

export default Defensive
