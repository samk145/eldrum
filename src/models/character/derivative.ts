import type Actor from './actor'
import type { ExpressionOptions, StatExpression } from './stat'
import type { StatNames } from './stats'

import { computed } from 'mobx'
import Stat from './stat'

export class Derivative<ActorType extends Actor = Actor> extends Stat<ActorType> {
  constructor(
    name: StatNames,
    actor: ActorType,
    expressions: ExpressionOptions<Derivative<ActorType>> = {}
  ) {
    super(name, actor, expressions)

    this.baseValueExpressions = [
      ...(expressions.preExpressions || []),
      ...(expressions.expressions || []),
      ...(expressions.postExpressions || [])
    ]
  }

  protected readonly baseValueExpressions: StatExpression[]

  @computed get baseValue() {
    return this.baseValueExpressions.reduce((value, expression) => expression(value, this), 0)
  }
}

export default Derivative
