import type { StatModifier } from '@actnone/eldrum-engine/models'
import type { DemoCharacter } from '../character'

import { Derivative, PreviewDerivative, MaxEncumbrance } from '@actnone/eldrum-engine/models'

export class DemoMaxEncumbrance extends Derivative<DemoCharacter> {
  constructor(actor: DemoCharacter) {
    super(MaxEncumbrance.statName, actor, {
      expressions: [
        (_, context) => DemoMaxEncumbrance.calculation(context.actor.level, context.actor.strength)
      ]
    })
  }

  preview(character: DemoCharacter, strength: number, statModifiers: StatModifier[]) {
    return new DemoPreviewMaxEncumbrance(character, strength, statModifiers)
  }

  static calculation = (level: number, strength: number) => level + (1 + strength) * 3
}

export class DemoPreviewMaxEncumbrance extends PreviewDerivative {
  constructor(character: DemoCharacter, strength: number, statModifiers: StatModifier[]) {
    super(
      MaxEncumbrance.statName,
      character,
      {
        expressions: [() => DemoMaxEncumbrance.calculation(character.level, strength)]
      },
      statModifiers
    )
  }
}
