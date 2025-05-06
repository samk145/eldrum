import { DemoEffect } from './effect'
import type { StatModifier } from '@actnone/eldrum-engine/models'

class Disoriented extends DemoEffect {
  static id = 'disoriented' as const
  id = Disoriented.id
  uses = 1

  statModifiers: StatModifier[] = [
    {
      statName: 'hitMeleeChance',
      type: 'factor',
      value: 0.7
    },
    {
      statName: 'hitRangedChance',
      type: 'factor',
      value: 0.7
    }
  ]

  postCombat = () => this.remove()

  postCombatTurn = async () => {
    this.use()
  }
}

export default Disoriented
