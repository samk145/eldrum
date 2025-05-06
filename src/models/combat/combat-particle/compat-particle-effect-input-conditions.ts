import type { CombatParticleResult } from './combat-particle-result'

interface IEffectInputConditionBase<ConditionType = string, Params = unknown[]> {
  type: ConditionType
  parameters: Params
  negate?: boolean
}

export type TEffectInputCondition =
  | IEffectInputConditionBase<'random', [number]>
  | IEffectInputConditionBase<'wasCriticalHit', []>
  | IEffectInputConditionBase<'wasBlocked', []>
  | IEffectInputConditionBase<'wasEvaded', []>
  | IEffectInputConditionBase<'didHit', []>
  | IEffectInputConditionBase<'inflictedDamage', []>

export type TEffectInputConditionType = TEffectInputCondition['type']

type TEffectInputConditionParameters<T extends TEffectInputConditionType> = Extract<
  TEffectInputCondition,
  { type: T }
>['parameters']

export type TEffectInputConditionFns = {
  [K in TEffectInputConditionType]: (
    parameters: TEffectInputConditionParameters<K>,
    result: CombatParticleResult
  ) => boolean
}

export class EffectInputCondition {
  constructor(
    public readonly type: TEffectInputConditionType,
    public readonly parameters: TEffectInputConditionParameters<TEffectInputConditionType> = [],
    public readonly negate?: boolean
  ) {}
}

export const effectInputConditions: TEffectInputConditionFns = {
  wasCriticalHit: (_, result) => result.wasCritical,
  wasBlocked: (_, result) => result.wasBlocked,
  wasEvaded: (_, result) => result.wasEvaded,
  didHit: (_, result) => result.hit,
  inflictedDamage: (_, result) => result.inflictedDamage > 0,
  random: (parameters, _) => {
    const [chance] = parameters

    return chance > Math.random()
  }
}
