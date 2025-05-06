import type { StatModifier } from '@actnone/eldrum-engine/models'
import { DemoEffect } from './effect'

class Hamstrung extends DemoEffect {
  static id = 'hamstrung' as const
  id = Hamstrung.id
  uses = 2
  stackable = true
  statModifiers: StatModifier[] = [
    {
      statName: 'speed',
      type: 'factor',
      value: 0.85
    },
    {
      statName: 'evadeMeleeChance',
      type: 'term',
      value: -0.1
    },
    {
      statName: 'evadeRangedChance',
      type: 'term',
      value: -0.1
    }
  ]

  postCombatTurn = async () => {
    const { use } = this
    use()
  }

  postCombat = () => this.remove()
}

export default Hamstrung
