import type Game from '../models/game'
import type { Database } from '../models/database'
import type UiStore from './ui'
import type SettingsStore from './settings'

import { t } from '../i18n'
import { action, computed } from 'mobx'
import EventEmitter from 'eventemitter3'
import { logger } from '../helpers/logger'
import { analytics } from '../helpers/analytics'
import Save, { SaveType } from '../models/database/schemas/save'
import { uuid } from '../helpers/misc'
import { UiConfirmCanceledError } from './ui'

const limits = {
  [SaveType.auto]: 15,
  [SaveType.manual]: 30,
  [SaveType.stash]: 1,
  [SaveType.ephemeral]: 1
}

enum SavesAnalyticsEvents {
  REACHED_SAVE_LIMIT = 'Reached Save Limit',
  CREATED_SAVE = 'Created Save'
}

export enum Event {
  DELETE = 'delete',
  CREATE = 'create'
}

export interface ISavesStoreGenerics {
  Database: Database
  Save: Save
  Game: Game
}

export type TSaveFactory<TGame extends Game = Game, TSave extends Save = Save> = (props: {
  id?: string | undefined
  game?: TGame
  timeSpent?: number
  timestamp?: number
  type: SaveType
}) => TSave

export class SavesStore<G extends ISavesStoreGenerics = ISavesStoreGenerics> {
  constructor(
    private readonly stores: {
      ui: UiStore
      settings: SettingsStore
    },
    private readonly database: G['Database'],
    public readonly saveFactory: TSaveFactory<G['Game'], G['Save']>
  ) {}

  saves: G['Save'][] = []
  overrideSelectedPlaythrough: string | null = null
  eventEmitter = new EventEmitter<Event>()

  resetPlaythroughSelectionOverride = () => (this.overrideSelectedPlaythrough = null)

  @computed get sortedSavesByCreation(): G['Save'][] {
    return this.sortSaves(this.saves.slice())
  }

  @computed get playthroughs(): G['Save'][][] {
    const nonStashSaves = this.sortedSavesByCreation.filter(save => save.type !== SaveType.stash)
    const playthroughIds = [...new Set(nonStashSaves.map(s => s.saveData?._id))]

    return playthroughIds.map(gameId =>
      this.getSavesByTypeAndId([SaveType.auto, SaveType.manual, SaveType.ephemeral], gameId)
    )
  }

  @computed get stashSave(): G['Save'] | null {
    const stash = this.saves.find(save => save.type === SaveType.stash)

    return stash || null
  }

  /**
   * Includes stash save
   */
  @computed get hasAnySave(): boolean {
    return !!this.saves.find(save => save.saveData)
  }

  /**
   * Excludes stash save
   */
  @computed get hasLoadableSave(): boolean {
    return !!this.saves.find(save => save.saveData && save.type !== SaveType.stash)
  }

  @action refreshSaves = async () => {
    this.saves = await this.getSavesFromStorage()
  }

  async deleteAllSaves() {
    await this.deleteSaves()
  }

  /**
   * Delete saves
   *
   * @param {string} [gameId] - Limit the deleted saves to only those that match
   *                            the supplied game id
   */
  async deleteSaves(gameId?: string) {
    const remainingSaves = await this.database.deleteMany<G['Save']>(
      Save.schema.name,
      'saveData._id == $0',
      [gameId]
    )

    this.saves = remainingSaves
    this.eventEmitter.emit(Event.DELETE)
  }

  async deleteSave(id: string) {
    await this.database.delete(Save.schema.name, id)
    this.saves = this.saves.filter(save => save.id !== id)
    this.eventEmitter.emit(Event.DELETE)
  }

  async deleteMoreRecentSaves(currentSave: G['Save']) {
    const currentPlaythrough = this.playthroughs.find(
      playthrough => playthrough[0].saveData?._id === currentSave?.saveData?._id
    )

    // We only want to do it if the loaded save has a valid timestamp
    if (!currentSave.timestamp) {
      logger.error(`Can't delete recent saves because selected save doesn't have a timestamp.`)
    }

    if (currentPlaythrough?.length && currentSave.timestamp) {
      const newerSaves = currentPlaythrough.filter(aSave => aSave.timestamp > currentSave.timestamp)

      while (newerSaves.length) {
        const lastId = newerSaves[newerSaves.length - 1].id

        await this.deleteSave(lastId)
        newerSaves.pop()
      }
    }
  }

  async saveTo(game: G['Game'], saveType: SaveType, timeSpent: number) {
    try {
      const { ui, settings } = this.stores

      logger.debug(`Saving game to ${saveType} save`)

      const preExistingSavesOfSameType = this.getSavesByTypeAndId(saveType, game._id)

      if (
        saveType === SaveType.manual &&
        preExistingSavesOfSameType.length >= SavesStore.limits[saveType]
      ) {
        if (settings.values.showSaveLimitWarning) {
          analytics.event(SavesAnalyticsEvents.REACHED_SAVE_LIMIT)

          const continueIndex = await ui.confirm(
            t('SAVE-GAME-LIMIT-HEADLINE'),
            t('SAVE-GAME-LIMIT-MESSAGE', { limit: SavesStore.limits[saveType] }),
            [t('SAVE-GAME-LIMIT-BUTTON-A'), t('SAVE-GAME-LIMIT-BUTTON-B')]
          )

          if (continueIndex === 1) {
            await settings.changeSetting('showSaveLimitWarning', false)
          }
        }
      }

      const newSave = this.saveFactory({
        id: saveType === SaveType.stash ? this.stashSave?.id : undefined,
        game,
        type: saveType,
        timeSpent,
        timestamp: Date.now()
      })

      const newParsedSave = await this.database.createOrUpdate<G['Save']>(Save.schema.name, newSave)

      if (saveType !== SaveType.stash) {
        while (preExistingSavesOfSameType.length > SavesStore.limits[saveType] - 1) {
          const lastId = preExistingSavesOfSameType[preExistingSavesOfSameType.length - 1].id

          await this.deleteSave(lastId)
          preExistingSavesOfSameType.pop()
        }
      } else if (this.stashSave) {
        this.saves = this.saves.filter(save => save.id !== this.stashSave?.id)
      }

      this.saves.push(newParsedSave)
      this.eventEmitter.emit(Event.CREATE)

      if (saveType === SaveType.manual) {
        analytics.event(SavesAnalyticsEvents.CREATED_SAVE, {
          type: saveType,
          hoursSpent: this.timeSpentAsHours(timeSpent)
        })
      }

      return newSave.id
    } catch (error) {
      if (!(error instanceof UiConfirmCanceledError)) {
        logger.error(error)
      }

      throw new Error(error as string)
    }
  }

  timeSpentAsHours(timeSpent: number) {
    return Math.floor(timeSpent / 1000 / 60 / 60)
  }

  getSavesByTypeAndId(type: SaveType | SaveType[], gameId?: string) {
    return this.sortedSavesByCreation.filter(save => {
      const conditions: boolean[] = []

      conditions.push(!!save.saveData)
      conditions.push(!gameId || save.saveData?._id === gameId)
      conditions.push(
        (Array.isArray(type) && type.includes(save.type)) ||
          (typeof type === 'string' && save.type === type)
      )

      return conditions.every(condition => condition)
    })
  }

  getLatestSave(gameId?: string, excludeStash: boolean = false): G['Save'] {
    const saveTypes = [SaveType.auto, SaveType.manual, SaveType.ephemeral]

    if (!excludeStash) {
      saveTypes.push(SaveType.stash)
    }

    const filteredSaves = this.getSavesByTypeAndId(saveTypes, gameId)

    const save = filteredSaves.reduce((latest, current) => {
      if (latest && latest.timestamp > current.timestamp) {
        return latest
      } else {
        return current
      }
    })

    return save
  }

  getLatestSaveForEachPlaythrough(exclude?: string): G['Save'][] {
    const ids = this.playthroughs.map(playthrough => playthrough[0].saveData?._id)

    return ids.filter(id => !!id && id !== exclude).map(id => this.getLatestSave(id))
  }

  async getSavesFromStorage() {
    return await this.database.collection<G['Save']>(Save.schema.name)
  }

  sortSaves(saves: G['Save'][]) {
    return saves.sort((a, b) => b.timestamp - a.timestamp)
  }

  async getSave(saveId: string) {
    const save: G['Save'] | undefined = await this.database.document<G['Save'], 'id'>(
      Save.schema.name,
      saveId
    )

    if (!save?.saveData) {
      throw new Error(`Couldn't get saved data for ${saveId}.`)
    }

    return save
  }

  async branchFromSave(selectedSave: G['Save']) {
    const playthroughToCopy = this.playthroughs.find(
      playthrough => playthrough[0].saveData?._id === selectedSave.saveData?._id
    )
    const savesToCopy = playthroughToCopy?.filter(
      playthroughSave => playthroughSave.timestamp <= selectedSave.timestamp
    )
    const newGameId = uuid()
    const savesToCreate = savesToCopy?.map(this.prepareSaveToCopy(newGameId))

    if (!savesToCreate?.length) {
      logger.error('Unable to branch playthrough, no playthrough with requested id.')
      return
    }

    await Promise.all(
      savesToCreate.map(async save => {
        await this.database.createOrUpdate(Save.schema.name, save)
        this.saves.push(save)
      })
    )

    return newGameId
  }

  prepareSaveToCopy(newGameId: string) {
    return (save: G['Save']): G['Save'] => ({
      ...save,
      id: uuid(),
      saveData: save.saveData && {
        ...save.saveData,
        _id: newGameId
      }
    })
  }

  static limits = limits
}

export default SavesStore
