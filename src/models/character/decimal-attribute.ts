import type Actor from './actor'
import type { ExpressionOptions, StatExpression } from './stat'
import type { StatNames } from './stats'

import { action, observable } from 'mobx'
import Stat from './stat'

class DecimalAttribute extends Stat {
  constructor(name: StatNames, actor: Actor, baseValue: number = 0) {
    super(name, actor, DecimalAttribute.defaultOptions)
    this.setBaseValue(baseValue)
  }

  @observable baseValue = 0

  @action setBaseValue = (value: number) => (this.baseValue = value)

  static get defaultOptions(): ExpressionOptions<DecimalAttribute> {
    return {
      preExpressions: [(_, attribute) => attribute.baseValue],
      expressions: [],
      postExpressions: [DecimalAttribute.clampValue]
    }
  }

  private static readonly clampValue: StatExpression<DecimalAttribute> = (value: number) =>
    Math.max(value, 0)
}

export default DecimalAttribute
