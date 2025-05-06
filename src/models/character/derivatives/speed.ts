import type { TActor } from '../t-actor'
import type Character from '../character'
import type Npc from '../npc'
import { mergeExpressionOptions } from '../stat'
import type { ExpressionOptions, StatExpression } from '../stat'
import type { StatModifier } from '../stat-modifier'

import Derivative from '../derivative'
import PreviewDerivative from '../preview-derivative'

export abstract class Speed<ActorType extends TActor> extends Derivative<ActorType> {
  constructor(actor: ActorType, expressionOptions: ExpressionOptions = {}) {
    super(
      Speed.statName,
      actor,
      mergeExpressionOptions<Derivative>(
        {
          expressions: [(_, context) => Speed.calculation(context.actor.agility)],
          postExpressions: [Speed.clampMinValue, Speed.clampMaxValue]
        },
        expressionOptions
      )
    )
  }

  static statName = 'speed' as const
  static clampAgilityBonus = 2.5

  public static calculation = (agility: number) =>
    Math.min(1 + (agility - 1) * 0.1, Speed.clampAgilityBonus)

  public static clampMinValue: StatExpression = value => Math.max(value, 0.2)
  public static clampMaxValue: StatExpression = value => Math.min(value, 3.5)

  public static format = (value: number) => `${value.toFixed(1)} tps`

  get formatted() {
    return Speed.format(this.value)
  }
}

export class CharacterSpeed extends Speed<Character> {
  preview(character: Character, agility: number, statModifiers: StatModifier[]) {
    return new PreviewSpeed(character, agility, statModifiers)
  }
}

export class PreviewSpeed extends PreviewDerivative {
  constructor(character: Character, agility: number, statModifiers: StatModifier[]) {
    super(
      Speed.statName,
      character,
      {
        expressions: [() => Speed.calculation(agility)],
        postExpressions: [Speed.clampMinValue, Speed.clampMaxValue]
      },
      statModifiers
    )
  }
}

export class NpcSpeed extends Speed<Npc> {
  constructor(actor: Npc) {
    super(actor, { postExpressions: [NpcSpeed.penalty] })
  }

  static readonly penalty: StatExpression<Derivative> = value => value * 0.8
}
