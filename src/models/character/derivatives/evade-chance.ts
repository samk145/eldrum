import type { TActor } from '../t-actor'
import type Character from '../character'
import type Npc from '../npc'
import type { StatNames } from '../stats'
import Derivative from '../derivative'
import { type ExpressionOptions, mergeExpressionOptions, type StatExpression } from '../stat'
import PreviewDerivative from '../preview-derivative'
import { type StatModifier } from '../stat-modifier'
import { clampBetween } from '../../../helpers/misc'

class EvadeChance extends Derivative {
  constructor(name: StatNames, actor: TActor, expressionOptions: ExpressionOptions<Derivative>) {
    super(
      name,
      actor,
      mergeExpressionOptions<Derivative>(expressionOptions, {
        postExpressions: [EvadeChance.clampBetween]
      })
    )
  }

  static clampBetween: StatExpression<Derivative> = value => clampBetween(value, 0, 1.8)
}

class EvadeMeleeChance<ActorType extends TActor> extends EvadeChance {
  constructor(actor: ActorType, expressions: StatExpression[] = []) {
    super(EvadeMeleeChance.statName, actor, {
      expressions: [
        (_, context) => EvadeMeleeChance.calculation(context.actor.agility),
        ...expressions
      ]
    })
  }

  static statName = 'evadeMeleeChance' as const

  static calculation = (agility: number) => 1 + agility * 0.05
}

class EvadeRangedChance<ActorType extends TActor> extends EvadeChance {
  constructor(actor: ActorType, expressions: StatExpression[] = []) {
    super(EvadeRangedChance.statName, actor, {
      expressions: [
        (_, context) => EvadeRangedChance.calculation(context.actor.agility),
        ...expressions
      ]
    })
  }

  static statName = 'evadeRangedChance' as const

  static calculation = (agility: number) => 0.9 + agility * 0.02
}

export class CharacterEvadeMeleeChance extends EvadeMeleeChance<Character> {
  constructor(character: Character) {
    super(character, [CharacterEvadeMeleeChance.nearDeathBonus])
  }

  preview(character: Character, agility: number, statModifiers: StatModifier[]) {
    return new PreviewEvadeMeleeChance(character, agility, statModifiers)
  }

  static nearDeathBonus: StatExpression<Derivative> = (value, context) =>
    context.actor.healthPercentage <= 0.15 ? value + 0.15 : value
}

export class CharacterEvadeRangedChance extends EvadeRangedChance<Character> {
  constructor(character: Character) {
    super(character, [CharacterEvadeMeleeChance.nearDeathBonus])
  }

  preview(character: Character, agility: number, statModifiers: StatModifier[]) {
    return new PreviewEvadeRangedChance(character, agility, statModifiers)
  }
}

export class PreviewEvadeMeleeChance extends PreviewDerivative {
  constructor(character: Character, agility: number, statModifiers: StatModifier[]) {
    super(
      EvadeMeleeChance.statName,
      character,
      {
        expressions: [() => EvadeMeleeChance.calculation(agility)],
        postExpressions: [EvadeChance.clampBetween]
      },
      statModifiers
    )
  }
}

export class PreviewEvadeRangedChance extends PreviewDerivative {
  constructor(character: Character, agility: number, statModifiers: StatModifier[]) {
    super(
      EvadeRangedChance.statName,
      character,
      {
        expressions: [() => EvadeRangedChance.calculation(agility)],
        postExpressions: [EvadeChance.clampBetween]
      },
      statModifiers
    )
  }
}

export class NpcEvadeMeleeChance extends EvadeMeleeChance<Npc> {
  constructor(npc: Npc) {
    super(npc, [NpcEvadeMeleeChance.penalty])
  }

  private static readonly penalty: StatExpression<Derivative> = value => value * 0.9
}

export class NpcEvadeRangedChance extends EvadeRangedChance<Npc> {
  constructor(npc: Npc) {
    super(npc, [NpcEvadeRangedChance.penalty])
  }

  private static readonly penalty: StatExpression<Derivative> = value => value * 0.9
}
