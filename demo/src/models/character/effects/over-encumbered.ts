import type { StatModifier } from '@actnone/eldrum-engine/models'
import { DemoEffect } from './effect'

class OverEncumbered extends DemoEffect {
  static id = 'overEncumbered' as const
  id = OverEncumbered.id

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
      statName: 'speed',
      type: 'factor',
      value: 0.5
    }
  ]
}

export default OverEncumbered
