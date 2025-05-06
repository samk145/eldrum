import type Character from '../character'
import type { StatExpression } from '../stat'
import type { StatModifier } from '../stat-modifier'
import type CharacterItem from '../../item/character-item'
import Derivative from '../derivative'
import PreviewDerivative from '../preview-derivative'

export class CharacterBlockChance extends Derivative<Character> {
  constructor(character: Character) {
    super('blockChance', character, {
      expressions: [
        (_, context) =>
          CharacterBlockChance.blockChanceCalculation(context.actor.inventory.equippedItems),
        (value, context) =>
          CharacterBlockChance.resilienceBonusCalculation(value, context.actor.resilience)
      ],
      postExpressions: [CharacterBlockChance.clampMaxValue],
      config: { lockTermsAtZero: true }
    })
  }

  preview = (
    character: Character,
    resilience: number,
    equippedItems: CharacterItem[],
    statModifiers: StatModifier[]
  ) => new PreviewBlockChance(character, resilience, equippedItems, statModifiers)

  public static blockChanceCalculation = (equippedItems: CharacterItem[]) =>
    equippedItems.reduce(
      (sum: number, item) => (item.blockChance ? sum + item.blockChance : sum),
      0
    )

  public static resilienceBonusCalculation = (value: number, resilience: number) =>
    value > 0 ? value + Math.max((resilience - 1) * 0.02, 0) : 0

  public static clampMaxValue: StatExpression = value => Math.min(value, 0.8)
}

export class PreviewBlockChance extends PreviewDerivative {
  constructor(
    character: Character,
    resilience: number,
    equippedItems: CharacterItem[],
    statModifiers: StatModifier[]
  ) {
    super(
      'blockChance',
      character,
      {
        expressions: [
          () => CharacterBlockChance.blockChanceCalculation(equippedItems),
          value => CharacterBlockChance.resilienceBonusCalculation(value, resilience)
        ],
        postExpressions: [CharacterBlockChance.clampMaxValue],
        config: { lockTermsAtZero: true }
      },
      statModifiers
    )
  }
}
