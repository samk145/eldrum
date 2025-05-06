import type Character from './character'
import Derivative from './derivative'
import { type StatModifier } from './stat-modifier'
import { type ExpressionOptions } from './stat'
import { type StatNames } from './stats'

export class PreviewDerivative extends Derivative<Character> {
  constructor(
    name: StatNames,
    actor: Character,
    expressions: ExpressionOptions,
    private readonly statModifiers: StatModifier[]
  ) {
    super(name, actor, expressions)
  }

  collectStatModifiers(): StatModifier[] {
    return this.statModifiers
  }
}

export default PreviewDerivative
