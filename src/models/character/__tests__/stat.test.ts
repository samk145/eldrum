import type { StatModifier } from '../stat-modifier'
import Stat from '../stat'

describe('Stat modifier calculation', () => {
  it('Should handle applying a single factor', () => {
    const baseValue = 10

    const modifiers: StatModifier[] = [
      {
        statName: 'protection',
        type: 'factor',
        value: 2
      }
    ]

    const output = Stat.applyStatModifiers(baseValue, modifiers)

    expect(output).toBe(20)
  })

  it('Should handle applying multiple factors', () => {
    const baseValue = 10

    const modifiers: StatModifier[] = [
      {
        statName: 'protection',
        type: 'factor',
        value: 1.5
      },
      {
        statName: 'protection',
        type: 'factor',
        value: 1.5
      }
    ]

    const output = Stat.applyStatModifiers(baseValue, modifiers)

    expect(output).toBe(20)
  })

  it('Should handle applying a single term', () => {
    const baseValue = 10

    const modifiers: StatModifier[] = [
      {
        statName: 'protection',
        type: 'term',
        value: 5
      }
    ]

    const output = Stat.applyStatModifiers(baseValue, modifiers)

    expect(output).toBe(15)
  })

  it('Should handle applying multiple terms', () => {
    const baseValue = 10

    const modifiers: StatModifier[] = [
      {
        statName: 'protection',
        type: 'term',
        value: 5
      },
      {
        statName: 'protection',
        type: 'term',
        value: -2
      },
      {
        statName: 'protection',
        type: 'term',
        value: 10
      }
    ]

    const output = Stat.applyStatModifiers(baseValue, modifiers)

    expect(output).toBe(10 + 5 - 2 + 10)
  })

  it('Should handle a mix of terms and factors', () => {
    const baseValue = 10

    const modifiers: StatModifier[] = [
      {
        statName: 'protection',
        type: 'term',
        value: 5
      },
      {
        statName: 'protection',
        type: 'factor',
        value: 5
      },
      {
        statName: 'protection',
        type: 'term',
        value: -10
      }
    ]

    const output = Stat.applyStatModifiers(baseValue, modifiers)

    expect(output).toBe(45)
  })

  it('Should handle neutral modifiers', () => {
    const baseValue = 10

    const modifiers: StatModifier[] = [
      {
        statName: 'protection',
        type: 'term',
        value: 0
      },
      {
        statName: 'protection',
        type: 'factor',
        value: 1
      }
    ]

    const output = Stat.applyStatModifiers(baseValue, modifiers)

    expect(output).toBe(10)
  })

  it('Should should always output the last set value', () => {
    const baseValue = 10

    const modifiers: StatModifier[] = [
      {
        statName: 'maxHealth',
        type: 'set',
        value: 1
      },
      {
        statName: 'maxHealth',
        type: 'term',
        value: 3
      },
      {
        statName: 'maxHealth',
        type: 'set',
        value: 50
      },
      {
        statName: 'maxHealth',
        type: 'factor',
        value: 2
      }
    ]

    const output = Stat.applyStatModifiers(baseValue, modifiers)

    expect(output).toBe(50)
  })
})
