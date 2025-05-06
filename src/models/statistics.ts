import { action, type IObservableValue, observable, type ObservableMap } from 'mobx'
import type Game from './game'
import { type SaveData } from './database/schemas/save/save-data'

function createObservableMap<ValueType = number>(dictionary: Record<string, ValueType> = {}) {
  return observable.map<string, ValueType>(dictionary)
}

type TNumberDictionaryStatistic = (typeof Statistics.numberDictionaryStatistics)[number]
type TBooleanDictionaryStatistic = (typeof Statistics.booleanDictionaryStatistics)[number]
type TStringStatistic = (typeof Statistics.stringStatistics)[number]
type TTrackLastStatistic = (typeof Statistics.trackLastStatistics)[number][0]
type TBooleanStatistic = (typeof Statistics.booleanStatistics)[number]
type TStatistic =
  | TNumberDictionaryStatistic
  | TBooleanDictionaryStatistic
  | TStringStatistic
  | TBooleanStatistic

function isNumberDictionaryStatistic(s: TStatistic): s is TNumberDictionaryStatistic {
  return Statistics.numberDictionaryStatistics.includes(s as TNumberDictionaryStatistic)
}

function isBooleanStatistic(s: TStatistic): s is TBooleanStatistic {
  return Statistics.booleanStatistics.includes(s as TBooleanStatistic)
}

function isBooleanDictionaryStatistic(s: TStatistic): s is TBooleanDictionaryStatistic {
  return Statistics.booleanDictionaryStatistics.includes(s as TBooleanDictionaryStatistic)
}

function isStringStatistic(s: TStatistic): s is TStringStatistic {
  return Statistics.stringStatistics.includes(s as TStringStatistic)
}

function isTrackLastStatistic(s: TStatistic): s is TTrackLastStatistic {
  return !!Statistics.trackLastStatistics.find(([statistic]) => statistic === s)
}

type UnionStatistics = Record<TBooleanDictionaryStatistic, ObservableMap<string, boolean>> &
  Record<TNumberDictionaryStatistic, ObservableMap<string, number>> &
  Record<TStringStatistic, IObservableValue<string | null>>

interface Statistics extends UnionStatistics {}
class Statistics {
  constructor(game: Game) {
    this.storedSaveData = game._default

    const statistics = this.storedSaveData.statistics

    this.usedOptions = createObservableMap(statistics.usedOptions)
    this.lastUsedOption = observable.box(statistics.lastUsedOption)
    this.usedMovementOptions = createObservableMap(statistics.usedMovementOptions)
    this.lastUsedMovementOption = observable.box(statistics.lastUsedMovementOption)
    this.seenNodes = createObservableMap(statistics.seenNodes)
    this.lastSeenNode = observable.box(statistics.lastSeenNode)
    this.seenScenes = createObservableMap(statistics.seenScenes)
    this.lastSeenScene = observable.box(statistics.lastSeenScene)
    this.seenLocations = createObservableMap(statistics.seenLocations)
    this.lastSeenLocation = observable.box(statistics.lastSeenLocation)
    this.seenAreas = createObservableMap(statistics.seenAreas)
    this.lastSeenArea = observable.box(statistics.lastSeenArea)
    this.usedPaths = createObservableMap(statistics.usedPaths)
    this.seenPathEncounters = createObservableMap(statistics.seenPathEncounters)
    this.seenOptionOutcomes = createObservableMap(statistics.seenOptionOutcomes)
    this.defeatedNpcsInCombat = createObservableMap(statistics.defeatedNpcsInCombat)
    this.killedNpcsInCombat = createObservableMap(statistics.killedNpcsInCombat)
    this.gainedItems = createObservableMap(statistics.gainedItems)
    this.consumedItems = createObservableMap(statistics.consumedItems)
    this.seenMedia = createObservableMap<boolean>(statistics.seenMedia)
    this.openedScriptures = createObservableMap<boolean>(statistics.openedScriptures)
    this.wonLastCombat = statistics.wonLastCombat || false
  }

  static numberDictionaryStatistics = [
    'usedOptions',
    'usedMovementOptions',
    'usedPaths',
    'seenPathEncounters',
    'seenNodes',
    'seenScenes',
    'seenLocations',
    'seenAreas',
    'seenOptionOutcomes',
    'defeatedNpcsInCombat',
    'killedNpcsInCombat',
    'gainedItems',
    'consumedItems'
  ] as const

  static booleanDictionaryStatistics = ['seenMedia', 'openedScriptures'] as const

  static stringStatistics = [
    'lastSeenNode',
    'lastSeenScene',
    'lastSeenArea',
    'lastSeenLocation',
    'lastUsedOption',
    'lastUsedMovementOption'
  ] as const

  static trackLastStatistics = [
    ['usedOptions', 'lastUsedOption'],
    ['usedMovementOptions', 'lastUsedMovementOption'],
    ['seenNodes', 'lastSeenNode'],
    ['seenScenes', 'lastSeenScene'],
    ['seenLocations', 'lastSeenLocation'],
    ['seenAreas', 'lastSeenArea']
  ] as const

  static booleanStatistics = ['wonLastCombat'] as const

  getRecord(statisticName: TBooleanDictionaryStatistic, id: string): boolean
  getRecord(statisticName: TNumberDictionaryStatistic, id: string): number
  getRecord(statisticName: TStringStatistic): string | null
  getRecord(statisticName: TBooleanStatistic): boolean

  getRecord(statisticName: TStatistic, id?: string) {
    if (isBooleanStatistic(statisticName)) {
      return this[statisticName]
    }

    if (isStringStatistic(statisticName)) {
      return this[statisticName].get()
    }

    if (isBooleanDictionaryStatistic(statisticName) || isNumberDictionaryStatistic(statisticName)) {
      if (!id) {
        throw new Error(
          'For boolean dictionary or number dictionary statistics, parameter "id" is required'
        )
      }

      if (isBooleanDictionaryStatistic(statisticName)) {
        return this[statisticName].get(id) || false
      }

      return this[statisticName].get(id) || 0
    }

    throw new Error(`"No statistic found with name.`)
  }

  /**
   * This will automatically track everything relevant to a statistic change:
   * - if statistic is a **number dictionary** it will add 1 to it
   * - if statistic is a **boolean dictionary** it will set it to true
   * - if statistic is a **string statistic** it will assign **id** to it
   *
   * It automatically checks if it needs to track last of that statistic
   *
   * - E.g.: if statistic is "usedOptions" it will record both "usedOptions" and "lastUsedOption"
   */
  record(statistic: TBooleanStatistic, value: boolean): void
  record(statisticName: TBooleanDictionaryStatistic, id: string): void
  record(statisticName: TNumberDictionaryStatistic, id: string): void

  @action record(statistic: TStatistic, id?: string | boolean) {
    if (isBooleanStatistic(statistic) && typeof id === 'boolean') {
      this[statistic] = id
      return
    }

    if (!id || typeof id === 'boolean') {
      throw new Error(
        `For dictionary statistics, parameter "id" is required and must be a string. Received: ${id}`
      )
    }

    if (isNumberDictionaryStatistic(statistic)) {
      this[statistic].set(id, (this[statistic]?.get(id) || 0) + 1)
    }
    if (isBooleanDictionaryStatistic(statistic)) {
      this[statistic].set(id, true)
    }
    if (isTrackLastStatistic(statistic)) {
      const trackLastPair = Statistics.trackLastStatistics.find(([s]) => s === statistic)
      const lastOfStatistic: TStringStatistic | undefined = trackLastPair?.[1]

      if (!lastOfStatistic) {
        throw new Error(
          `Statistic type "${statistic}" is a trackLastStatistic, but seems to not have a corresponding pair. Please add ${statistic} to Statistics.trackLastStatistics static property.`
        )
      }

      this[lastOfStatistic].set(id)
    }

    if (isStringStatistic(statistic)) {
      this[statistic].set(id)
    }
  }

  hasUsedOption = (id: string) => !!this.getRecord('usedOptions', id)
  hasUsedMovementOption = (id: string) => !!this.getRecord('usedMovementOptions', id)
  hasSeenLocation = (id: string) => !!this.getRecord('seenLocations', id)

  @observable wonLastCombat: boolean

  storedSaveData: SaveData & { _fromSaved: boolean }
}

export { Statistics }
export default Statistics
