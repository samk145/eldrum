import type { Stores } from '.'
import type { Save } from '../models/database/schemas/save'
import type { Game, TGameConstructorParams } from '../models/game'

import { AppState, type AppStateStatus } from 'react-native'
import { action, observable, reaction, type IReactionDisposer } from 'mobx'
import { t } from '../i18n'
import { SaveType } from '../models/database/schemas/save'
import { logger } from '../helpers/logger'
import { delay, uuid } from '../helpers/misc'
import { analytics } from '../helpers/analytics'

const LOADING_CONTENT_LOAD_MESSAGE = 'Loading content from editor...'

enum UiAnalyticsEvents {
  STARTED_NEW_PLAYTHROUGH = 'Started New Playthrough',
  LOADED_GAME = 'Loaded Game',
  DELETED_PLAYTHROUGH = 'Deleted Playthrough',
  BRANCHED_PLAYTHROUGH = 'Branched Playthrough'
}

export type TGameFactory<TGame extends Game = Game> = (params: TGameConstructorParams) => TGame

export interface IPlayStoreGenerics {
  Game: Game
  Save: Save
}

export class PlayStore<G extends IPlayStoreGenerics = IPlayStoreGenerics> {
  constructor(
    public readonly gameFactory: TGameFactory<G['Game']>,
    private readonly stores: Stores
  ) {
    AppState.addEventListener('change', this.handleApplicationStateChangeForTimers)
    AppState.addEventListener('change', this.handleApplicationStateChangeForSaving)

    this.gameTimeTracking = reaction(
      () => this.stores.ui.state,
      state => {
        const { game } = this

        if (state !== 'in-game') return

        if (game && !this.currentGameId) {
          this.startGameTimeTracking(game._id)
        } else if (game && game._id !== this.currentGameId) {
          this.resetGameTimeTracking()
          this.startGameTimeTracking(game._id)
        }
      },
      { name: 'gameTimeTracking' }
    )
  }

  @observable game: G['Game'] | null = null
  currentGameId: string | null = null
  currentGameSessionStart: number | null = null
  currentGameTime: number = 0
  @observable gameWasJustCompleted = false
  gameTimeTracking: IReactionDisposer
  private previousAppState: AppStateStatus = AppState.currentState

  @action endGame = async () => {
    this.stores.ui.changeState('loading')

    try {
      if (this.game) {
        await this.game.unmount()
      }
    } catch (error) {
      logger.error(error)
    } finally {
      this.game = null
      this.stores.ui.changeState('start')
      this.gameWasJustCompleted = true
    }
  }

  @action async initiateGame(data: G['Save']['saveData'], fromSaved: boolean) {
    this.gameWasJustCompleted = false

    if (this.game) {
      try {
        await this.game.unmount()
      } catch (error) {
        logger.error(error)
      }
    }

    this.game = this.gameFactory([
      {
        ui: this.stores.ui,
        settings: this.stores.settings,
        content: this.stores.content,
        achievements: this.stores.achievements,
        play: this
      },
      data,
      fromSaved
    ])

    if (this.game) {
      await this.game.mount()
    }

    this.stores.ui.changeState('in-game')
  }

  @action saveToWithPlayTime = async (type: SaveType) => {
    this.updateCurrentGameTime()

    if (!this.game) {
      throw new Error('Cannot save without an active game running')
    }

    return await this.stores.saves.saveTo(this.game, type, this.currentGameTime)
  }

  @action autoSave = async () => {
    await this.saveToWithPlayTime(SaveType.auto)
  }

  reloadContentFromEditor = async () => {
    const { saves, content, ui } = this.stores
    const { game } = this

    try {
      ui.setLoading(t('PLAY-SAVE_GAME-LOADING_MESSAGE'))
      const saveId = await this.saveToWithPlayTime(SaveType.stash)

      if (game) {
        await game.unmount()
      }

      ui.setLoading(LOADING_CONTENT_LOAD_MESSAGE)
      await content.populateRemoteContent()

      ui.setLoading(t('PLAY-LOAD_SAVE-LOADING_MESSAGE'))
      const save = await saves.getSave(saveId)

      if (save) {
        this.loadGame(save)
      }
    } catch (err) {
      logger.error(err as Error)
    }
  }

  loadFromUrl = async (url: string) => {
    const { ui } = this.stores
    const { game } = this

    try {
      ui.setLoading('Retrieving data...')

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow'
      })

      const save = (await response.json()) as unknown as Save

      if (game) {
        ui.setLoading('Unloading game...')
        await game.unmount()
      }

      if (save?.id) {
        save.id = uuid()

        if (save.saveData) {
          save.saveData._id = uuid()
        }

        this.loadGame(save)
      } else {
        throw new Error('Invalid save data')
      }
    } catch (err) {
      logger.error(err as Error)
      ui.changeState('start')
    }
  }

  @action continueGame = () => {
    this.stores.ui.changeState('in-game')
  }

  @action newGame = async () => {
    const { content } = this.stores
    const defaultValues = this.stores.saves
      .saveFactory({ type: SaveType.manual })
      .saveDataFactory(undefined, content.data)

    defaultValues.startDate = Date.now()

    this.stores.ui.changeState('loading')
    analytics.event(UiAnalyticsEvents.STARTED_NEW_PLAYTHROUGH)
    await this.initiateGame(defaultValues, false)
    await this.saveToWithPlayTime(SaveType.auto)
  }

  @action saveGame = async (saveType: SaveType) => {
    try {
      await this.saveToWithPlayTime(saveType)
    } catch (error) {
      logger.error(error)
    }

    this.stores.ui.changeState('in-game')
  }

  @action async branchPlaythroughFromSave(save: G['Save'], autoLoadGame = true) {
    try {
      const { saves } = this.stores

      this.stores.ui.setLoading(t('PLAY-BRANCH_PLAYTHROUGH-LOADING_MESSAGE'))
      await delay(50)

      const newGameId = await saves.branchFromSave(save)
      const newLatestSave = saves.getLatestSave(newGameId)
      analytics.event(UiAnalyticsEvents.BRANCHED_PLAYTHROUGH)

      if (!newGameId || !newLatestSave) {
        return
      }

      if (autoLoadGame) {
        return await this.loadGame(newLatestSave)
      }

      saves.overrideSelectedPlaythrough = newGameId
      this.stores.ui.changeState('start')

      return newLatestSave
    } catch (error) {
      logger.error(error)
    }
  }

  @action async loadGame(save: G['Save']) {
    const { saves, ui } = this.stores

    logger.debug(`Loading save from ${save.type} slot`)

    try {
      ui.changeState('loading')
      if (!save.saveData) {
        throw new Error(`Tried to load slot with no saveData: ${save.saveData}`)
      }

      await saves.deleteMoreRecentSaves(save)
      await this.initiateGame(save.saveData, true)

      if (!this.currentGameTime) {
        this.currentGameTime = save.timeSpent || 0
      }

      analytics.event(UiAnalyticsEvents.LOADED_GAME, {
        saveType: save.type,
        hoursSpent: saves.timeSpentAsHours(save.timeSpent)
      })
    } catch (error) {
      logger.error(error)
    }
  }

  @action loadFromLatestSave = (gameId?: string | undefined, excludeStash = false) => {
    const save = this.stores.saves.getLatestSave(gameId, excludeStash)

    if (save) {
      this.loadGame(save)
    } else {
      this.newGame()
    }
  }

  deleteSave = async (saveId: string) => {
    try {
      const { saves, ui } = this.stores

      ui.setLoading(t('PLAY-DELETE_SAVE-LOADING_MESSAGE'))
      await saves.deleteSave(saveId)
      ui.changeState('start')
    } catch (error) {
      logger.error(error)
    }
  }

  @action deletePlaythrough = async (gameId: string) => {
    const { saves, ui } = this.stores
    const { game } = this

    ui.setLoading(t('PLAY-DELETE_PLAYTHROUGH-LOADING_MESSAGE'))
    await delay(50)

    try {
      if (game?.isRunning && game._id === gameId) {
        await game.unmount()
        this.game = null
      }

      await saves.deleteSaves(gameId)
    } catch (error) {
      logger.error(error)
    }

    ui.changeState('start')
    analytics.event(UiAnalyticsEvents.DELETED_PLAYTHROUGH)
  }

  @action handleApplicationStateChangeForSaving = (nextAppState: AppStateStatus) => {
    const { ui } = this.stores
    const { game } = this

    // Save the game if the player leaves the app.
    if (
      nextAppState.match(/inactive|background/) &&
      ui.state === 'in-game' &&
      this.previousAppState === 'active' &&
      game?.character.alive &&
      !game.combat &&
      !game.ending.active
    ) {
      this.saveGame(SaveType.stash)
    }

    this.previousAppState = nextAppState
  }

  handleApplicationStateChangeForTimers = (nextAppState: AppStateStatus) => {
    if (!this.currentGameTime) return

    if (nextAppState === 'active') {
      this.resumeGameTimeTracking()
    } else {
      this.pauseGameTimeTracking()
    }
  }

  startGameTimeTracking = (gameId: string) => {
    this.currentGameId = gameId
    this.currentGameSessionStart = Date.now()
  }

  resetGameTimeTracking = () => {
    this.currentGameId = null
    this.currentGameSessionStart = null
    this.currentGameTime = 0
  }

  pauseGameTimeTracking = () => {
    this.updateCurrentGameTime()
    this.currentGameSessionStart = null
  }

  resumeGameTimeTracking = () => {
    this.currentGameSessionStart = Date.now()
  }

  updateCurrentGameTime = () => {
    const { currentGameSessionStart } = this

    if (currentGameSessionStart) {
      this.currentGameTime += Date.now() - currentGameSessionStart
    }

    this.currentGameSessionStart = Date.now()
  }

  soundToggleReaction = reaction(
    () => this.stores.settings.values.soundEnabled,
    soundEnabled => {
      const { settings } = this.stores
      const { game } = this

      try {
        if (soundEnabled && game && game.isRunning) {
          game.sound.resumeAllTracks()
        } else if (!soundEnabled && game && game.isRunning) {
          game.sound.pauseAllTracks()
        }
      } catch (error) {
        logger.error(error)
      }

      if (soundEnabled && settings.startTrack && !game) {
        settings.startMenuTrack()
      } else if (!soundEnabled && settings.startTrack && !game) {
        settings.stopMenuTrack()
      }
    },
    { name: 'soundToggleReaction' }
  )
}

export default PlayStore
