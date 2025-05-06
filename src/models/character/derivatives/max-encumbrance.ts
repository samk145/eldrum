import type Character from '../character'
import Derivative from '../derivative'
import PreviewDerivative from '../preview-derivative'
import { type StatModifier } from '../stat-modifier'

export class MaxEncumbrance extends Derivative<Character> {
  constructor(actor: Character) {
    super(MaxEncumbrance.statName, actor, {
      expressions: [
        (_, context) => MaxEncumbrance.calculation(context.actor.level, context.actor.strength)
      ],
      postExpressions: [MaxEncumbrance.round]
    })
  }

  preview(character: Character, strength: number, statModifiers: StatModifier[]) {
    return new PreviewMaxEncumbrance(character, strength, statModifiers)
  }

  static statName = 'maxEncumbrance' as const

  static calculation = (level: number, strength: number) => level + (1 + strength) * 4
}

export class PreviewMaxEncumbrance extends PreviewDerivative {
  constructor(character: Character, strength: number, statModifiers: StatModifier[]) {
    super(
      MaxEncumbrance.statName,
      character,
      {
        expressions: [() => MaxEncumbrance.calculation(character.level, strength)]
      },
      statModifiers
    )
  }
}
