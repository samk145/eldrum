import type AchievementsStore from '../../stores/achievements'
import { type EditorAchievement } from '@actnone/eldrum-editor/dist/types'
import { computed, observable, reaction, action, type IReactionDisposer } from 'mobx'
import { t } from '../../i18n'
import { AchievementTask } from './achievement-task'

export interface Achievement extends Omit<EditorAchievement, 'tasks'> {
  tasks: AchievementTask[]
}

export class Achievement {
  constructor(
    achievement: EditorAchievement,
    public achievementsStore: AchievementsStore
  ) {
    const { values } = achievementsStore

    Object.assign(this, achievement)

    this.isComplete = !!values.achievementsCompleted[this._id]
    this.hasUpdate = !!values.achievementsWithUpdate[this._id]
    this.tasks = achievement.tasks.map(task => new AchievementTask(task, this))

    if (!this.isComplete) {
      this.completionReaction = reaction(
        () => this.tasksAreComplete,
        isComplete => {
          if (isComplete) {
            this.markAsComplete()

            if (this.completionReaction) {
              this.completionReaction()
            }
          }
        },
        { name: 'AchievementCompletionReaction', fireImmediately: true }
      )
    }

    if (achievement.conditionsToDiscover.length && !values.achievementsDiscovered[this._id]) {
      this.discoveryReaction = reaction(
        () => this.isDiscovered,
        isDiscovered => {
          if (isDiscovered) {
            this.markAsDiscovered()

            if (this.discoveryReaction) {
              this.discoveryReaction()
            }
          }
        },
        { name: 'AchievementDiscoveryReaction', fireImmediately: true }
      )
    }
  }

  conditionsToDiscover: EditorAchievement['conditionsToDiscover'] = []
  @observable isComplete: boolean
  @observable tasks: AchievementTask[] = []
  @observable hasUpdate: boolean
  completionReaction?: IReactionDisposer
  discoveryReaction?: IReactionDisposer

  get name() {
    return t(`ACHIEVEMENT-${this._id}-NAME`, { ns: 'achievements' })
  }

  private set name(_: string) {}

  get description() {
    return t(`ACHIEVEMENT-${this._id}-DESC`, { ns: 'achievements' })
  }

  private set description(_: string) {}

  @computed get isDiscovered() {
    const { values, passesConditions } = this.achievementsStore

    if (values.achievementsDiscovered[this._id] || this.isComplete) {
      return true
    }

    return passesConditions(this.conditionsToDiscover)
  }

  @computed get tasksAreComplete() {
    if (this.achievementsStore.values.achievementsCompleted[this._id]) {
      return true
    }

    return this.tasks.every(task => task.isComplete)
  }

  @action markAsSeen = () => {
    this.hasUpdate = false
    this.achievementsStore.register('achievementUpdate', this._id, false)
  }

  @action changeCompletionStatus = (status: boolean) => {
    if (status) {
      this.markAsDiscovered()
    }

    this.hasUpdate = status
    this.isComplete = status
    this.achievementsStore.register('achievementUpdate', this._id, status)
    this.achievementsStore.register('achievementCompletion', this._id, status)
  }

  @action toggleCompletionStatus = () => {
    this.changeCompletionStatus(!this.isComplete)
  }

  @action markAsComplete = () => {
    this.changeCompletionStatus(true)
  }

  markAsDiscovered = () => {
    this.achievementsStore.register('achievementDiscovery', this._id)
  }
}
