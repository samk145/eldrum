import type { TActor } from '../t-actor'
import type Character from '../character'
import type Npc from '../npc'
import type { ExpressionOptions } from '../stat'
import { mergeExpressionOptions } from '../stat'

import Derivative from '../derivative'
import PreviewDerivative from '../preview-derivative'
import { type StatModifier } from '../stat-modifier'

export class Initiative<ActorType extends TActor> extends Derivative {
  constructor(actor: ActorType, expressionOptions: ExpressionOptions<Derivative> = {}) {
    super(
      Initiative.statName,
      actor,
      mergeExpressionOptions<Derivative>(
        {
          expressions: [
            (_, context) => Initiative.calculation(context.actor.level, context.actor.agility)
          ],
          postExpressions: []
        },
        expressionOptions
      )
    )
  }

  static statName = 'initiative' as const

  static calculation = (level: number, agility: number) => 1 + level * 0.1 + (agility - 1) * 0.5
}

export class CharacterInitiative extends Initiative<Character> {}

export class PreviewInitiative extends PreviewDerivative {
  constructor(character: Character, agility: number, statModifiers: StatModifier[]) {
    super(
      Initiative.statName,
      character,
      {
        expressions: [() => Initiative.calculation(character.level, agility)],
        postExpressions: []
      },
      statModifiers
    )
  }
}

export class NpcInitiative extends Initiative<Npc> {}
