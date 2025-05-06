import type { AttributeValues } from '../character/attributes'
import { Actors } from '../actors'

const getLevelFromAttributes = (attributes: AttributeValues) => {
  return Object.values(attributes).reduce((sum, value) => sum + value, -5 + 1)
}

describe('Actor level scaling', () => {
  it('Should scale action points upwards in fixed 1-2-3 steps when input level and value are 1', () => {
    const outputs = [
      Actors.scaleActionPoints(1, 1, 4),
      Actors.scaleActionPoints(1, 1, 7),
      Actors.scaleActionPoints(1, 1, 12)
    ]

    expect(outputs).toEqual([1, 2, 3])
  })

  it('Should round action points upwards', () => {
    const outputs = [
      Actors.scaleActionPoints(3, 15, 17),
      Actors.scaleActionPoints(3, 15, 12),
      Actors.scaleActionPoints(3, 15, 6),
      Actors.scaleActionPoints(3, 15, 4)
    ]

    expect(outputs).toEqual([4, 3, 2, 1])
  })

  it('Should consistently scale DOWN attribute distribution', () => {
    const tests: [AttributeValues, number, AttributeValues][] = [
      // Input, Target level, Expected output
      [
        {
          strength: 1,
          charisma: 1,
          resilience: 1,
          agility: 1,
          perception: 1
        },
        1,
        {
          strength: 1,
          charisma: 1,
          resilience: 1,
          agility: 1,
          perception: 1
        }
      ],
      [
        {
          strength: 10,
          charisma: 1,
          resilience: 1,
          agility: 1,
          perception: 1
        },
        5,
        {
          strength: 5,
          charisma: 1,
          resilience: 1,
          agility: 1,
          perception: 1
        }
      ],
      [
        {
          strength: 5,
          charisma: 1,
          resilience: 1,
          agility: 6,
          perception: 1
        },
        5,
        {
          strength: 2,
          charisma: 1,
          resilience: 1,
          agility: 4,
          perception: 1
        }
      ],
      [
        {
          strength: 6,
          charisma: 1,
          resilience: 1,
          agility: 5,
          perception: 1
        },
        5,
        {
          strength: 4,
          charisma: 1,
          resilience: 1,
          agility: 2,
          perception: 1
        }
      ],
      [
        {
          strength: 2,
          charisma: 3,
          resilience: 3,
          agility: 5,
          perception: 6
        },
        2,
        {
          strength: 1,
          charisma: 1,
          resilience: 1,
          agility: 1,
          perception: 2
        }
      ],
      [
        {
          strength: 10,
          charisma: 4,
          resilience: 8,
          agility: 6,
          perception: 6
        },
        10,
        {
          strength: 4, // 31%
          charisma: 1, // 13%
          resilience: 4, // 24%
          agility: 3, // 17%
          perception: 2 // 17%
        }
      ]
    ]

    tests.forEach(([input, targetLevel, expectedOutput]) => {
      const output = Actors.scaleAttributes(input, targetLevel)

      expect(output).toMatchObject(expectedOutput)
      expect(getLevelFromAttributes(output)).toEqual(targetLevel)
    })
  })

  it('Should consistently scale UP attribute distribution', () => {
    const tests: [AttributeValues, number, AttributeValues][] = [
      [
        {
          strength: 1,
          charisma: 1,
          resilience: 1,
          agility: 1,
          perception: 1
        },
        1,
        {
          strength: 1,
          charisma: 1,
          resilience: 1,
          agility: 1,
          perception: 1
        }
      ],
      [
        {
          strength: 5,
          charisma: 1,
          resilience: 1,
          agility: 1,
          perception: 1
        },
        10,
        {
          strength: 10,
          charisma: 1,
          resilience: 1,
          agility: 1,
          perception: 1
        }
      ],
      [
        {
          strength: 3,
          charisma: 1,
          resilience: 2,
          agility: 2,
          perception: 1
        },
        40,
        {
          strength: 21,
          charisma: 1,
          resilience: 11,
          agility: 10,
          perception: 1
        }
      ],
      [
        {
          strength: 7,
          charisma: 5,
          resilience: 5,
          agility: 2,
          perception: 1
        },
        20,
        {
          strength: 9,
          charisma: 6,
          resilience: 6,
          agility: 2,
          perception: 1
        }
      ]
    ]

    tests.forEach(([input, targetLevel, expectedOutput]) => {
      const output = Actors.scaleAttributes(input, targetLevel)

      expect(output).toMatchObject(expectedOutput)
      expect(getLevelFromAttributes(output)).toEqual(targetLevel)
    })
  })
})
