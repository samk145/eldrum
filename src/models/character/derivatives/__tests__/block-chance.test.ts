import type Character from '../../character'
import type { StatModifier } from '../../stat-modifier'
import type CharacterItem from '../../../item/character-item'
import type Item from '../../../item/item'
import { CharacterBlockChance, PreviewBlockChance } from '..'

describe('Block Chance Derivatives', () => {
  describe('CharacterBlockChance', () => {
    let blockChanceDerivative: CharacterBlockChance
    let mockedCharacter: Character

    beforeEach(() => {
      mockedCharacter = {
        inventory: {
          get equippedItems(): CharacterItem[] {
            return []
          }
        },
        get resilience(): number {
          return 0
        },
        get statModifiers(): StatModifier[] {
          return []
        }
      } as Character
      blockChanceDerivative = new CharacterBlockChance(mockedCharacter)
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it.each([
      // No block chance items, no resilience
      [[], 0, 0],
      // No block chance items, low resilience - no reslience bonus
      [[], 1, 0],
      // No block chance items, high resilience - no resilience bonus
      [[], 10, 0],
      // Cannot exceed clamped max value of 0.8
      [[{ blockChance: 1 }], 1, 0.8],
      [[{ blockChance: 0.5 }, { blockChance: 0.5 }], 10, 0.8],
      // Adding multiple equipped items with block chance together
      [[{ blockChance: 0.1 }, { blockChance: 0.1 }], 0, 0.2],
      // Resilience too low to recieve bonus
      [[{ blockChance: 0.1 }], 1, 0.1],
      // Resilience at minimum bonus
      [[{ blockChance: 0.1 }], 2, 0.12]
    ])(
      'should correctly calculate block chance\n\titems: %j\n\tresilience: %p\n\texpected: %p',
      (items: Partial<Item>[], resilience: number, expected: number) => {
        const equippedItemsSpy = jest
          .spyOn(mockedCharacter.inventory, 'equippedItems', 'get')
          .mockImplementation(() => items as CharacterItem[])

        const resilienceSpy = jest
          .spyOn(mockedCharacter, 'resilience', 'get')
          .mockImplementation(() => resilience)

        expect(blockChanceDerivative.value).toBeCloseTo(expected)
        expect(equippedItemsSpy).toHaveBeenCalled()
        expect(resilienceSpy).toHaveBeenCalled()
      }
    )

    it('should lock term stat modifiers to 0 when base block chance is 0', () => {
      const items: Partial<Item>[] = []
      const statModifiers: StatModifier[] = [
        {
          statName: 'blockChance',
          value: 10,
          type: 'term'
        }
      ]
      const resilience = 1
      const expected = 0

      const equippedItemsSpy = jest
        .spyOn(mockedCharacter.inventory, 'equippedItems', 'get')
        .mockImplementation(() => items as CharacterItem[])
      const resilienceSpy = jest
        .spyOn(mockedCharacter, 'resilience', 'get')
        .mockImplementation(() => resilience)
      const statModifiersSpy = jest
        .spyOn(mockedCharacter, 'statModifiers', 'get')
        .mockImplementation(() => statModifiers)

      expect(blockChanceDerivative.value).toBeCloseTo(expected)
      expect(equippedItemsSpy).toHaveBeenCalled()
      expect(resilienceSpy).toHaveBeenCalled()
      expect(statModifiersSpy).toHaveBeenCalled()
    })
  })
  describe('PreviewBlockChance', () => {
    let blockChanceDerivative: PreviewBlockChance
    let mockedCharacter: Character

    beforeEach(() => {
      mockedCharacter = {} as Character
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it.each([
      // No block chance items, no resilience
      [[], 0, 0],
      // No block chance items, low resilience - no reslience bonus
      [[], 1, 0],
      // No block chance items, high resilience - no resilience bonus
      [[], 10, 0],
      // Cannot exceed clamped max value of 0.8
      [[{ blockChance: 1 }], 1, 0.8],
      [[{ blockChance: 0.5 }, { blockChance: 0.5 }], 10, 0.8],
      // Adding multiple equipped items with block chance together
      [[{ blockChance: 0.1 }, { blockChance: 0.1 }], 0, 0.2],
      // Resilience too low to recieve bonus
      [[{ blockChance: 0.1 }], 1, 0.1],
      // Resilience at minimum bonus
      [[{ blockChance: 0.1 }], 2, 0.12]
    ])(
      'should correctly calculate block chance\n\titems: %j\n\tresilience: %p\n\texpected: %p',
      (items: Partial<Item>[], resilience: number, expected: number) => {
        blockChanceDerivative = new PreviewBlockChance(
          mockedCharacter,
          resilience,
          items as CharacterItem[],
          []
        )

        expect(blockChanceDerivative.value).toBeCloseTo(expected)
      }
    )

    it('should lock term stat modifiers to 0 when base block chance is 0', () => {
      const items: Partial<Item>[] = []
      const statModifiers: StatModifier[] = [
        {
          statName: 'blockChance',
          value: 10,
          type: 'term'
        }
      ]
      const resilience = 1
      const expected = 0

      blockChanceDerivative = new PreviewBlockChance(
        mockedCharacter,
        resilience,
        items as CharacterItem[],
        statModifiers
      )

      expect(blockChanceDerivative.value).toBeCloseTo(expected)
    })
  })
})
