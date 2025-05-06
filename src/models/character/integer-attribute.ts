import type { ExpressionOptions, StatExpression } from './stat'
import type { StatModifier } from './stat-modifier'
import type { StatNames } from './stats'
import type { TActor } from './t-actor'
import type Actor from './actor'

import { action, observable } from 'mobx'

import Stat from './stat'

export class IntegerAttribute extends Stat {
  constructor(name: StatNames, actor: Actor, baseValue = 1) {
    super(name, actor, IntegerAttribute.defaultOptions)
    this.setBaseValue(baseValue)
  }

  @observable baseValue = 0

  @action increaseBaseValue = () => this.baseValue++
  @action decreaseBaseValue = () => this.baseValue--
  @action setBaseValue = (value: number) => (this.baseValue = value)

  static get defaultOptions(): ExpressionOptions<IntegerAttribute> {
    return {
      preExpressions: [(_, attribute) => attribute.baseValue],
      expressions: [],
      postExpressions: [IntegerAttribute.floorValue, IntegerAttribute.clampValue]
    }
  }

  private static readonly floorValue: StatExpression<IntegerAttribute> = (value: number) =>
    Math.floor(value)

  private static readonly clampValue: StatExpression<IntegerAttribute> = (value: number) =>
    Math.max(value, 1)
}

export class PreviewIntegerAttribute extends IntegerAttribute {
  constructor(
    name: StatNames,
    actor: TActor,
    private readonly statModifiers: StatModifier[],
    baseValue = 1
  ) {
    super(name, actor, baseValue)
  }

  collectStatModifiers(): StatModifier[] {
    return this.statModifiers
  }
}
