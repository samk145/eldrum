import { DemoEffect } from './effect'
import type { StatModifier } from '@actnone/eldrum-engine/models'

class Sundered extends DemoEffect {
  static id = 'sundered' as const
  id = Sundered.id
  uses = 1
  stackable = true
  statModifiers: StatModifier[] = [
    {
      statName: 'protection',
      type: 'factor',
      value: 0.8
    }
  ]

  postCombat = () => this.remove()
}

export default Sundered
