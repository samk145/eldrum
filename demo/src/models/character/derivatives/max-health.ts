import type {
  TActor,
  ExpressionOptions,
  StatExpression,
  StatModifier,
  Character
} from '@actnone/eldrum-engine/models'
import type { DemoNpc } from '../npc'

import {
  Derivative,
  PreviewDerivative,
  mergeExpressionOptions
} from '@actnone/eldrum-engine/models'

export class DemoMaxHealth<ActorType extends TActor> extends Derivative {
  constructor(actor: ActorType, expressionOptions: ExpressionOptions<Derivative> = {}) {
    super(
      DemoMaxHealth.statName,
      actor,
      mergeExpressionOptions<Derivative>(
        {
          expressions: [
            (_, context) => DemoMaxHealth.calculation(context.actor.level, context.actor.resilience)
          ],
          postExpressions: [DemoMaxHealth.clamp, DemoMaxHealth.floor]
        },
        expressionOptions
      )
    )
  }

  static statName = 'maxHealth' as const

  static startingHealthTerm = 8
  static levelHealthModifier = 8
  static resilienceHealthModifier = 5

  static calculation = (level: number, resilience: number) =>
    DemoMaxHealth.startingHealthTerm +
    level * DemoMaxHealth.levelHealthModifier +
    resilience * DemoMaxHealth.resilienceHealthModifier

  static clamp: StatExpression<Derivative> = value => Math.max(value, 1)
}

export class DemoCharacterMaxHealth extends DemoMaxHealth<Character> {
  preview(actor: Character, resilience: number, statModifiers: StatModifier[]): PreviewMaxHealth {
    return new PreviewMaxHealth(actor, resilience, statModifiers)
  }
}

export class PreviewMaxHealth extends PreviewDerivative {
  constructor(character: Character, resilience: number, statModifiers: StatModifier[]) {
    super(
      DemoMaxHealth.statName,
      character,
      {
        expressions: [() => DemoMaxHealth.calculation(character.level, resilience)],
        postExpressions: [DemoMaxHealth.clamp, DemoMaxHealth.floor]
      },
      statModifiers
    )
  }
}

export class DemoNpcMaxHealth extends DemoMaxHealth<DemoNpc> {
  constructor(actor: DemoNpc) {
    super(actor, { postExpressions: [DemoNpcMaxHealth.bonus] })
  }

  private static readonly bonus: StatExpression<Derivative> = value => Math.round(value * 1.2)
}
