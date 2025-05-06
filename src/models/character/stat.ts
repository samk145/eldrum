import type Actor from './actor'
import type { StatModifier } from './stat-modifier'
import type { StatNames } from './stats'

import { computed } from 'mobx'
import { merge } from 'lodash'

export type StatExpression<StatContext extends Stat = any> = (
  value: number,
  context: StatContext
) => number

export type ExpressionOptionsConfiguration = {
  lockTermsAtZero?: boolean
}

export type ExpressionOptions<StatContext extends Stat = any> = {
  preExpressions?: StatExpression<StatContext>[]
  expressions?: StatExpression<StatContext>[]
  postExpressions?: StatExpression<StatContext>[]
  config?: ExpressionOptionsConfiguration
}

/**
 * Merges two sets of stat expression options. The second set will be added after
 * the first.
 */
export const mergeExpressionOptions = <T extends Stat = Stat>(
  a: ExpressionOptions<T>,
  b: ExpressionOptions<T>
): ExpressionOptions<T> => ({
  preExpressions: (a.preExpressions || []).concat(b.preExpressions || []),
  expressions: (a.expressions || []).concat(b.expressions || []),
  postExpressions: (a.postExpressions || []).concat(b.postExpressions || []),
  config: merge({}, a.config, b.config)
})

abstract class Stat<ActorType extends Actor = Actor> {
  constructor(
    public readonly name: StatNames,
    public actor: ActorType,
    expressionOptions: ExpressionOptions = {}
  ) {
    this.expressions = (expressionOptions.preExpressions || [])
      .concat(expressionOptions.expressions || [])
      .concat(Stat.postExpressions)
      .concat(expressionOptions.postExpressions || [])

    this.config = expressionOptions.config || {}
  }

  abstract baseValue: number
  public readonly expressions: StatExpression[]
  public readonly config: ExpressionOptionsConfiguration

  @computed get value() {
    return this.expressions.reduce((value, expression) => expression(value, this), 0)
  }

  @computed get filteredStatModifiers(): StatModifier[] {
    return this.collectStatModifiers().filter(statModifier => statModifier.statName === this.name)
  }

  collectStatModifiers(): StatModifier[] {
    return this.actor.statModifiers
  }

  static get postExpressions(): StatExpression<Stat>[] {
    return [Stat.statModifierReducer]
  }

  private static readonly statModifierReducer: StatExpression<Stat> = (
    value: number,
    stat: Stat
  ) => {
    return Stat.applyStatModifiers(value, stat.filteredStatModifiers, stat.config.lockTermsAtZero)
  }

  static applyStatModifiers(
    value: number,
    statModifiers: StatModifier[],
    lockTermsAtZero?: boolean
  ) {
    return statModifiers
      .sort((a, b) => {
        return a.type === 'set' ? 0 : -1
      })
      .reduce((currentValue: number, statModifier: StatModifier) => {
        if (statModifier.type === 'term' && lockTermsAtZero && value === 0) {
          return value
        }

        return Stat.statModifierReduceFn(value, currentValue, statModifier)
      }, value)
  }

  static statModifierReduceFn = (
    baseValue: number,
    currentValue: number,
    statModifier: StatModifier
  ) => {
    if (statModifier.type === 'term') {
      return currentValue + statModifier.value
    } else if (statModifier.type === 'factor') {
      return currentValue + (baseValue * statModifier.value - baseValue)
    } else if (statModifier.type === 'set') {
      return statModifier.value
    }

    return currentValue
  }

  static floor: StatExpression<Stat> = value => Math.floor(value)
  static round: StatExpression<Stat> = value => Math.round(value)
  static ceil: StatExpression<Stat> = value => Math.ceil(value)
}

export default Stat
