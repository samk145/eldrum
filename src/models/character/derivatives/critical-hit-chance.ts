import type { TActor } from '../t-actor'
import type Character from '../character'
import type Npc from '../npc'
import Derivative from '../derivative'
import { type StatExpression } from '../stat'
import PreviewDerivative from '../preview-derivative'
import { type StatModifier } from '../stat-modifier'

abstract class CriticalHitChance<ActorType extends TActor> extends Derivative {
  constructor(actor: ActorType, expressions: StatExpression[] = []) {
    super(CriticalHitChance.statName, actor, {
      expressions: [
        (_, context) => CriticalHitChance.calculation(context.actor.perception),
        ...expressions
      ],
      postExpressions: [CriticalHitChance.clampMaxValue, CriticalHitChance.clampMinValue]
    })
  }

  static statName = 'criticalHitChance' as const

  static baseValue = 0.1

  static calculation = (perception: number) => CriticalHitChance.baseValue + perception * 0.025

  static clampMaxValue: StatExpression<Derivative> = value => Math.min(value, 0.6)
  static clampMinValue: StatExpression<Derivative> = value => Math.max(value, 0)
}

export class CharacterCriticalHitChance extends CriticalHitChance<Character> {
  preview(character: Character, perception: number, statModifiers: StatModifier[]) {
    return new PreviewCriticalHitChance(character, perception, statModifiers)
  }
}

export class PreviewCriticalHitChance extends PreviewDerivative {
  constructor(character: Character, perception: number, statModifiers: StatModifier[]) {
    super(
      CriticalHitChance.statName,
      character,
      {
        expressions: [() => CriticalHitChance.calculation(perception)],
        postExpressions: [CriticalHitChance.clampMaxValue, CriticalHitChance.clampMinValue]
      },
      statModifiers
    )
  }
}

export class NpcCriticalHitChance extends CriticalHitChance<Npc> {
  constructor(npc: Npc) {
    super(npc, [NpcCriticalHitChance.penalty])
  }

  private static readonly penalty: StatExpression<Derivative> = value => value * 0.4
}
