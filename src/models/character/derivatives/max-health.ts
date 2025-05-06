import type { TActor } from '../t-actor'
import type Character from '../character'
import type Npc from '../npc'
import type { ExpressionOptions, StatExpression } from '../stat'
import { mergeExpressionOptions } from '../stat'

import Derivative from '../derivative'
import PreviewDerivative from '../preview-derivative'
import { type StatModifier } from '../stat-modifier'

export class MaxHealth<ActorType extends TActor> extends Derivative {
  constructor(actor: ActorType, expressionOptions: ExpressionOptions<Derivative> = {}) {
    super(
      MaxHealth.statName,
      actor,
      mergeExpressionOptions<Derivative>(
        {
          expressions: [
            (_, context) => MaxHealth.calculation(context.actor.level, context.actor.resilience)
          ],
          postExpressions: [MaxHealth.clamp, MaxHealth.floor]
        },
        expressionOptions
      )
    )
  }

  static statName = 'maxHealth' as const

  static startingHealthTerm = 20
  static levelHealthModifier = 5
  static resilienceHealthModifier = 10

  static calculation = (level: number, resilience: number) =>
    MaxHealth.startingHealthTerm +
    level * MaxHealth.levelHealthModifier +
    resilience * MaxHealth.resilienceHealthModifier

  static clamp: StatExpression<Derivative> = value => Math.max(value, 1)
}

export class CharacterMaxHealth extends MaxHealth<Character> {
  preview(actor: Character, resilience: number, statModifiers: StatModifier[]): PreviewMaxHealth {
    return new PreviewMaxHealth(actor, resilience, statModifiers)
  }
}

export class PreviewMaxHealth extends PreviewDerivative {
  constructor(character: Character, resilience: number, statModifiers: StatModifier[]) {
    super(
      MaxHealth.statName,
      character,
      {
        expressions: [() => MaxHealth.calculation(character.level, resilience)],
        postExpressions: [MaxHealth.clamp, MaxHealth.floor]
      },
      statModifiers
    )
  }
}

export class NpcMaxHealth extends MaxHealth<Npc> {}
