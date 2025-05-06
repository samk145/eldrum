import { computed, reaction, type IReactionDisposer } from 'mobx'
import { type EditorAchievementTask } from '@actnone/eldrum-editor/dist/types'
import type { Achievement } from './achievement'
import { t } from '../../i18n'
import { shortenObjectId } from '../../helpers/misc'

export interface AchievementTask extends EditorAchievementTask {}

export class AchievementTask {
  constructor(
    task: EditorAchievementTask,
    private readonly achievement: Achievement
  ) {
    const { achievementsStore } = this.achievement

    Object.assign(this, task)

    if (task.conditionsToDiscover.length && !achievementsStore.values.tasksDiscovered[this._id]) {
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
        { name: 'AchievementTaskDiscoveryReaction', fireImmediately: true }
      )
    }

    if (!achievementsStore.values.tasksCompleted[this._id]) {
      this.completionReaction = reaction(
        () => this.isComplete,
        isComplete => {
          if (isComplete) {
            this.markAsCompleted()

            if (this.completionReaction) {
              this.completionReaction()
            }
          }
        },
        { name: 'AchievementTaskCompletionReaction', fireImmediately: true }
      )
    }
  }

  conditions: EditorAchievementTask['conditions'] = []
  conditionsToDiscover: EditorAchievementTask['conditionsToDiscover'] = []
  private readonly discoveryReaction?: IReactionDisposer
  private readonly completionReaction?: IReactionDisposer

  get name() {
    return t(`ACHIEVEMENT-${this.achievement._id}-TASK-${shortenObjectId(this._id)}-NAME`, {
      ns: 'achievements'
    })
  }

  private set name(_: string) {}

  @computed get isComplete() {
    const { passesConditions, values } = this.achievement.achievementsStore

    if (values.tasksCompleted[this._id] || this.achievement.isComplete) {
      return true
    }

    return passesConditions(this.conditions)
  }

  @computed get isDiscovered() {
    const { values, passesConditions } = this.achievement.achievementsStore

    if (this.isComplete) {
      return true
    }

    return values.tasksDiscovered[this._id] || passesConditions(this.conditionsToDiscover)
  }

  markAsDiscovered = () => {
    this.achievement.achievementsStore.register('taskDiscovery', this._id)
  }

  changeCompletionStatus = (status: boolean) => {
    const { achievementsStore } = this.achievement

    if (status) {
      this.markAsDiscovered()
    }

    achievementsStore.register('taskCompletion', this._id, status)
  }

  markAsCompleted = () => {
    this.changeCompletionStatus(true)
  }

  toggleCompletionStatus = () => {
    this.changeCompletionStatus(!this.isComplete)
  }
}
