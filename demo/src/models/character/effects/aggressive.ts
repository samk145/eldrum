import { DemoEffect } from './effect'
import type { StatModifier } from '@actnone/eldrum-engine/models'

class Aggressive extends DemoEffect {
  static id = 'aggressive' as const
  id = Aggressive.id
  uses = 3
  extendable = true
  isStance = true
  statModifiers: StatModifier[] = [
    {
      statName: 'speed',
      type: 'factor',
      value: 1.25
    },
    {
      statName: 'criticalHitChance',
      type: 'term',
      value: 0.05
    }
  ]

  preCombatTurn = async () => this.use()

  postCombat = () => this.remove()
}

export default Aggressive
