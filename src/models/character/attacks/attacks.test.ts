import type { StatModifier } from '../stat-modifier'
import { Attacks } from './attacks'

describe('Attack damage calculation', () => {
  it('Should handle applying a single factor stat modifier', () => {
    const baseValue: Damage = {
      min: 1,
      max: 10
    }

    const modifiers: StatModifier[] = [
      {
        statName: 'meleeDamage',
        type: 'factor',
        value: 2
      }
    ]

    const output = Attacks.calculateDamage('meleeDamage', 0, baseValue, modifiers)

    expect(output.min).toBe(2)
    expect(output.max).toBe(20)
  })

  it('Should handle applying a multiple factor stat modifiers', () => {
    const baseValue: Damage = {
      min: 1,
      max: 2
    }

    const modifiers: StatModifier[] = [
      {
        statName: 'meleeDamage',
        type: 'factor',
        value: 2
      },
      {
        statName: 'meleeDamage',
        type: 'factor',
        value: 2
      },
      {
        statName: 'meleeDamage',
        type: 'factor',
        value: 3
      }
    ]

    const output = Attacks.calculateDamage('meleeDamage', 0, baseValue, modifiers)

    expect(output.min).toBe(5)
    expect(output.max).toBe(10)
  })
})
