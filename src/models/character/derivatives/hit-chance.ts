import type { TActor } from '../t-actor'
import type Character from '../character'
import type Npc from '../npc'
import type { StatNames } from '../stats'
import Derivative from '../derivative'
import { type ExpressionOptions, mergeExpressionOptions, type StatExpression } from '../stat'
import PreviewDerivative from '../preview-derivative'
import { type StatModifier } from '../stat-modifier'

class HitChance extends Derivative {
  constructor(name: StatNames, actor: TActor, expressionOptions: ExpressionOptions<Derivative>) {
    super(
      name,
      actor,
      mergeExpressionOptions<Derivative>(
        {
          postExpressions: [HitChance.clampToMinValue, HitChance.clampToMaxValue]
        },
        expressionOptions
      )
    )
  }

  static clampToMinValue: StatExpression<Derivative> = value => Math.max(value, 0.2)

  static clampToMaxValue: StatExpression<Derivative> = value => Math.min(value, 1.5)
}

class HitMeleeChance<ActorType extends TActor> extends HitChance {
  constructor(actor: ActorType, expressions: StatExpression[] = []) {
    super(HitMeleeChance.statName, actor, {
      expressions: [
        (_, context) => HitMeleeChance.hitChance(context.actor.perception),
        ...expressions
      ]
    })
  }

  static statName = 'hitMeleeChance' as const

  static hitChance = (senderPerception: number) => 0.95 + senderPerception * 0.05
}

class HitRangedChance<ActorType extends TActor> extends HitChance {
  constructor(actor: ActorType, expressions: StatExpression[] = []) {
    super(HitRangedChance.statName, actor, {
      expressions: [
        (_, context) => HitRangedChance.hitChance(context.actor.perception),
        ...expressions
      ]
    })
  }

  static statName = 'hitRangedChance' as const

  static hitChance = (senderPerception: number) => 0.75 + senderPerception * 0.05
}

export class CharacterHitMeleeChance extends HitMeleeChance<Character> {
  preview(actor: Character, perception: number, statModifiers: StatModifier[]) {
    return new PreviewHitMeleeChance(actor, perception, statModifiers)
  }
}

export class CharacterHitRangedChance extends HitRangedChance<Character> {
  preview(actor: Character, perception: number, statModifiers: StatModifier[]) {
    return new PreviewHitRangedChance(actor, perception, statModifiers)
  }
}

export class PreviewHitMeleeChance extends PreviewDerivative {
  constructor(character: Character, perception: number, statModifiers: StatModifier[]) {
    super(
      HitMeleeChance.statName,
      character,
      {
        expressions: [() => HitMeleeChance.hitChance(perception)],
        postExpressions: [HitChance.clampToMinValue, HitChance.clampToMaxValue]
      },
      statModifiers
    )
  }
}

export class PreviewHitRangedChance extends PreviewDerivative {
  constructor(character: Character, perception: number, statModifiers: StatModifier[]) {
    super(
      HitRangedChance.statName,
      character,
      {
        expressions: [() => HitRangedChance.hitChance(perception)],
        postExpressions: [HitChance.clampToMinValue, HitChance.clampToMaxValue]
      },
      statModifiers
    )
  }
}

export class NpcHitMeleeChance extends HitMeleeChance<Npc> {
  constructor(npc: Npc) {
    super(npc, [NpcHitMeleeChance.penalty, NpcHitMeleeChance.clampToMaxValue])
  }

  private static readonly penalty: StatExpression<Derivative> = value => value * 0.9
  static clampToMaxValue: StatExpression<Derivative> = value => Math.min(value, 1.1)
}

export class NpcHitRangedChance extends HitRangedChance<Npc> {
  constructor(npc: Npc) {
    super(npc, [NpcHitRangedChance.penalty, NpcHitRangedChance.clampToMaxValue])
  }

  private static readonly penalty: StatExpression<Derivative> = value => value * 0.9
  static clampToMaxValue: StatExpression<Derivative> = value => Math.min(value, 1.1)
}
