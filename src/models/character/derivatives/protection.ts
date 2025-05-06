import type { TActor } from '../t-actor'
import type Character from '../character'
import type Npc from '../npc'
import type { ExpressionOptions, StatExpression } from '../stat'
import type { StatModifier } from '../stat-modifier'

import Derivative from '../derivative'

type ResilienceBoosterFactory = (resilience: number) => StatExpression<Derivative>
type ResilienceBoosterCalculation = (value: number, resilience: number) => number
type DefaultOptionsFactory = (resilience: number, armor: number) => ExpressionOptions<Derivative>

export class Protection<ActorType extends TActor> extends Derivative {
  constructor(actor: ActorType) {
    super('protection', actor, Protection.defaultOptions)
  }

  public static statName = 'protection' as const

  public static readonly armorSelector: StatExpression<Derivative> = (_, derivative) =>
    derivative.actor.armor

  private static readonly resilienceBoosterExpression: StatExpression<Derivative> = (
    value,
    derivative
  ) => Protection.resilienceBoosterCalculation(value, derivative.actor.resilience)

  public static resilienceBoosterCalculation: ResilienceBoosterCalculation = (value, resilience) =>
    value + (resilience - 1) / 2

  public static clampMinValue: StatExpression = value => Math.max(value, 0)

  public static defaultOptions: ExpressionOptions<Derivative> = {
    expressions: [Protection.armorSelector, Protection.resilienceBoosterExpression],
    postExpressions: [Protection.clampMinValue, Protection.round]
  }
}

export class CharacterProtection extends Protection<Character> {
  preview(actor: Character, resilience: number, armor: number, statModifiers: StatModifier[]) {
    return new PreviewProtection(actor, resilience, armor, statModifiers)
  }
}

export class NpcProtection extends Protection<Npc> {}

export class PreviewProtection extends Derivative<Character> {
  constructor(
    actor: Character,
    resilience: number,
    armor: number,
    private readonly statModifiers: StatModifier[]
  ) {
    super(Protection.statName, actor, PreviewProtection.makeDefaultOptions(resilience, armor))
  }

  collectStatModifiers(): StatModifier[] {
    return this.statModifiers
  }

  private static readonly makeResilienceBooster: ResilienceBoosterFactory = resilience => value =>
    Protection.resilienceBoosterCalculation(value, resilience)

  private static readonly makeDefaultOptions: DefaultOptionsFactory = (resilience, armor) => ({
    expressions: [() => armor, PreviewProtection.makeResilienceBooster(resilience)],
    postExpressions: [Protection.floor]
  })
}
