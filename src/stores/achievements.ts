import type { Database } from '../models/database'
import { action, computed, observable, reaction } from 'mobx'
import Achievements from '../models/database/schemas/achievements'
import { analytics } from '../helpers/analytics'
import { logger } from '../helpers/logger'
import Conditions, { type TConditions, type TAchievementsConditionFns } from '../helpers/conditions'
import { Achievement } from '../models/achievements'
import type { Stores } from '.'
import type { Game } from '../models/game'
import { Event as SaveEvent } from './saves'

enum AchievementsAnalyticsEvents {
  COMPLETED_GAME = 'Completed Game'
}

export class AchievementsStore {
  constructor(
    private readonly stores: Pick<Stores, 'content' | 'ui' | 'settings' | 'saves' | 'play'>,
    private readonly database: Database
  ) {}

  init = async () => {
    this.updateGamesFromSaves()
    await this.restore()
    this.achievements = this.stores.content.data.achievements.map(a => new Achievement(a, this))
    this.trackProgress()

    this.stores.saves.eventEmitter.on(SaveEvent.DELETE, this.updateGamesFromSaves)
  }

  @observable gamesFromSaves: Game[] = []

  @action updateGamesFromSaves = () => {
    const otherPlaythroughs: Game[] = []
    const saves = this.stores.saves.getLatestSaveForEachPlaythrough(this.stores.play.game?._id)

    saves.forEach(save => {
      if (save.saveData) {
        otherPlaythroughs.push(
          this.stores.play.gameFactory([
            { achievements: this, ...this.stores },
            save.saveData,
            true
          ])
        )
      }
    })

    this.gamesFromSaves = otherPlaythroughs
  }

  @computed get games() {
    const currentGame: Game[] = this.stores.play.game ? [this.stores.play.game] : []

    return [...currentGame, ...this.gamesFromSaves]
  }

  @computed get hasUpdate() {
    return this.achievements.some(achievement => achievement.hasUpdate)
  }

  @computed get progress(): number {
    return (
      this.achievements.filter(achievement => achievement.isComplete).length /
      this.achievements.length
    )
  }

  get taskProgress(): number {
    const allTasks = this.achievements.flatMap(achievement => achievement.tasks)
    const tasksCompleted = allTasks.filter(task => task.isComplete)

    return tasksCompleted.length > 0 ? tasksCompleted.length / allTasks.length : 0
  }

  toPercentageString = (progressValue: number) => {
    return `${Math.floor(progressValue * 100)}%`
  }

  @observable achievements: Achievement[] = []

  @observable values: {
    user: string
    hasCompletedGame: boolean
    seenEndings: Record<string, boolean>
    achievementsWithUpdate: Record<string, boolean>
    achievementsCompleted: Record<string, boolean>
    achievementsDiscovered: Record<string, boolean>
    tasksDiscovered: Record<string, boolean>
    tasksCompleted: Record<string, boolean>
  } = {
    user: 'main',
    hasCompletedGame: false,
    seenEndings: {},
    achievementsWithUpdate: {},
    achievementsCompleted: {},
    achievementsDiscovered: {},
    tasksDiscovered: {},
    tasksCompleted: {}
  }

  @action markUpdatesAsSeen = () => {
    this.achievements.forEach(achievement => achievement.markAsSeen())
  }

  register = (
    type:
      | 'achievementCompletion'
      | 'achievementUpdate'
      | 'achievementDiscovery'
      | 'taskCompletion'
      | 'taskDiscovery',
    id: string,
    value: boolean = true
  ) => {
    switch (type) {
      case 'achievementCompletion': {
        this.values.achievementsCompleted[id] = value
        break
      }
      case 'achievementDiscovery': {
        this.values.achievementsDiscovered[id] = value
        break
      }
      case 'achievementUpdate': {
        this.values.achievementsWithUpdate[id] = value
        break
      }
      case 'taskDiscovery': {
        this.values.tasksDiscovered[id] = value
        break
      }
      case 'taskCompletion': {
        this.values.tasksCompleted[id] = value
        break
      }

      default: {
        logger.error('"type" argument passed to AchievementsStore.register is not a valid.')
      }
    }

    this.store()
    this.trackProgress()
  }

  recordSeenEnding = async (endingId: string | string[]) => {
    const endingIds = Array.isArray(endingId) ? endingId : [endingId]

    for (let i = 0; i < endingIds.length; i++) {
      this.values.seenEndings[endingIds[i]] = true
    }

    try {
      await this.store()
    } catch (error) {
      logger.error(error)
    }
  }

  recordHasCompletedGame = async () => {
    if (!this.values.hasCompletedGame) {
      this.values.hasCompletedGame = true

      try {
        await this.store()
      } catch (error) {
        logger.error(error)
      }
    }
  }

  recordEndingStatistics = async () => {
    const { play } = this.stores
    const hasReachedEndOfGame = Boolean(play.game?.ending.active)

    if (hasReachedEndOfGame && play.game) {
      await this.recordHasCompletedGame()
      await this.recordSeenEnding(play.game.ending.partials.map(partial => partial._id))

      play.updateCurrentGameTime()

      analytics.event(AchievementsAnalyticsEvents.COMPLETED_GAME, {
        hoursSpent: this.stores.saves.timeSpentAsHours(play.currentGameTime)
      })
    }
  }

  restore = async () => {
    const achievements = await this.database.collection<Achievements>(Achievements.schema.name)
    const storedCurrentUserAchievements = achievements.find(
      settings => settings.user === this.values.user
    )

    if (storedCurrentUserAchievements) {
      this.values = storedCurrentUserAchievements
    }
  }

  store = async () => {
    await this.database.createOrUpdate<Achievements>(
      Achievements.schema.name,
      new Achievements(this.values)
    )
  }

  hasReachedEndOfGameReaction = reaction(
    () => this.stores.play.game?.ending.active,
    hasReachedEndOfGame => {
      if (hasReachedEndOfGame) {
        this.recordEndingStatistics()
      }
    },
    { name: 'hasReachedEndOfGameReaction' }
  )

  passesConditions = (conditions: TConditions): boolean => {
    const { games } = this

    return games.some(game => Conditions.passesConditions(conditions, { game, achievements: this }))
  }

  conditions: TAchievementsConditionFns = {
    hasCompletedAchievement: (parameters, achievementsStore) => {
      const [achievementId] = parameters
      return !!achievementsStore.values.achievementsCompleted[achievementId]
    },
    hasCompletedAllAchievements: (_, achievementsStore) => {
      return achievementsStore.progress === 1
    },
    hasSeenEndingPartial: (parameters, achievementsStore) => {
      const [endingPartialId] = parameters

      return !!achievementsStore.values.seenEndings[endingPartialId]
    },
    hasCompletedGame: (_, achievementsStore) => {
      return achievementsStore.values.hasCompletedGame
    }
  }

  trackGameCompletion = reaction(
    () => this.values.hasCompletedGame,
    (hasCompletedGame, reaction) => {
      const property: Partial<Record<AchievementsAnalyticsEvents.COMPLETED_GAME, boolean>> = {}

      property[AchievementsAnalyticsEvents.COMPLETED_GAME] = hasCompletedGame

      analytics.addUserProperty(property)

      if (hasCompletedGame) {
        reaction.dispose()
      }
    },
    { name: 'trackGameCompletion', fireImmediately: true }
  )

  private readonly trackProgress = () => {
    const progress = Math.floor(this.taskProgress * 10) / 10 // Floor to nearest 10, i.e. 0.1, 0.2, 0.3, etc.

    analytics.addUserProperty({ achievementProgress: progress })
  }
}

export default AchievementsStore
