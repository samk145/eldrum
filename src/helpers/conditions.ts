import type {
  EditorCondition,
  EditorAchievementCondition,
  EditorGameCondition
} from '@actnone/eldrum-editor/dist/types'
import type { Game } from '../models/game'
import type { AchievementsStore } from '../stores/achievements'
import { logger } from './logger'

export type TGameConditionType = EditorGameCondition['type']
export type TAchievementsConditionType = EditorAchievementCondition['type']

export type TConditions<T = ''> = T extends 'achievements'
  ? EditorAchievementCondition[] | EditorAchievementCondition[][]
  : 'game' extends T
    ? EditorGameCondition[] | EditorGameCondition[][]
    :
        | (EditorAchievementCondition | EditorGameCondition)[]
        | (EditorAchievementCondition | EditorGameCondition)[][]

type TConditionType<T = ''> = T extends 'achievements'
  ? TAchievementsConditionType
  : 'game' extends T
    ? TGameConditionType
    : TAchievementsConditionType | TGameConditionType

type TConditionParameters<T extends TConditionType> = Extract<
  T extends TAchievementsConditionType
    ? EditorAchievementCondition
    : T extends TGameConditionType
      ? EditorGameCondition
      : EditorCondition['type'],
  { type: T }
>['parameters']

export type TGameConditions = TConditions<'game'>
export type TAchievementConditions = TConditions<'achievements'>

export type TGameConditionFns = {
  [K in TConditionType<'game'>]: (parameters: TConditionParameters<K>, game: Game) => boolean
}

export type TAchievementsConditionFns = {
  [K in TConditionType<'achievements'>]: (
    parameters: TConditionParameters<K>,
    achievementsStore: AchievementsStore
  ) => boolean
}

type TGameConditionFunction = TGameConditionFns[TConditionType<'game'>]
type TAchievementsConditionFunction = TAchievementsConditionFns[TConditionType<'achievements'>]

type TConditionStores = {
  game: Game
  achievements: AchievementsStore
}

type TConditionStoreName = keyof TConditionStores
type TConditionStore = Game | AchievementsStore
type TConditionFunction = TGameConditionFunction | TAchievementsConditionFunction
export type TConditionsResult = boolean | TVerboseConditionsResult
export type TVerboseConditionsResult<T extends EditorCondition = EditorCondition> = [boolean, T[]]

export class Conditions {
  static passesConditions<B extends boolean = false>(
    conditions: TConditions,
    stores: TConditionStores,
    verbose?: B
  ): B extends true ? TVerboseConditionsResult : boolean

  static passesConditions(
    conditions: TConditions = [],
    stores: TConditionStores,
    verbose: boolean = false
  ): TConditionsResult {
    const passedConditions: EditorCondition[] = []

    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i]
      const isConditionGroup = Array.isArray(condition)

      if (isConditionGroup) {
        const isLastConditionGroup = conditions.length - 1 === i
        const [passesConditionsInGroup, whichConditions] = Conditions.passesConditions(
          condition,
          stores,
          true
        )

        if (passesConditionsInGroup) {
          return verbose ? [true, whichConditions] : true
        } else if (!passesConditionsInGroup && isLastConditionGroup) {
          return verbose ? [false, whichConditions] : false
        }
      } else {
        if (!Conditions.passesCondition(condition, stores)) {
          return verbose ? [false, [condition]] : false
        } else {
          passedConditions.push(condition)
        }
      }
    }

    return verbose ? [true, passedConditions] : true
  }

  static passesCondition = (condition: EditorCondition, stores: TConditionStores) => {
    const [store, conditionFunction] = Conditions.getConditionFunctionFromDomain(condition, stores)

    if (!conditionFunction) {
      throw new Error(`passesCondition: cannot find test ${condition.type}`)
    }

    try {
      const passes = conditionFunction(condition.parameters, store)
      return condition.negate ? !passes : passes
    } catch (error) {
      logger.error(error)

      return false
    }
  }

  private static readonly getConditionFunctionFromDomain = (
    condition: EditorCondition,
    stores: TConditionStores
  ): [TConditionStore, TConditionFunction] => {
    for (const storeName in stores) {
      const store = stores[storeName as TConditionStoreName]
      const conditionFunction = store.conditions[condition.type]

      if (conditionFunction) {
        return [store, conditionFunction]
      }
    }

    throw new Error(
      'getConditionFunctionFromDomain: Could not find condition function or store class.'
    )
  }
}

export default Conditions
