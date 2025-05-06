import type { EditorQuest } from '@actnone/eldrum-editor/dist/types'
import type SaveDataQuest from '../database/schemas/save/save-data/save-data-quest'
import type Game from '../game'

import { observable, computed, action, reaction } from 'mobx'
import { t } from '../../i18n'
import { analytics } from '../../helpers/analytics'
import { QuestObjective } from './quest-objective'
import { shortenObjectId } from '../../helpers/misc'

enum QuestAnalyticsEvents {
  COMPLETED = 'Quest Completed'
}

export type TNotification = 'new' | 'updated' | 'completed' | null

export class Quest {
  constructor(
    public _game: Game,
    defaultProps: EditorQuest,
    storedProps?: SaveDataQuest
  ) {
    this._id = defaultProps._id

    if (storedProps) {
      Object.assign(this, storedProps)
    }

    this.objectives = defaultProps.objectives.map(objective => {
      const storedObjectiveProps = storedProps
        ? storedProps.objectives.find(o => o._id === objective._id)
        : undefined
      return new QuestObjective(this, objective, storedObjectiveProps)
    })
  }

  _id: string
  @observable objectives
  @observable notification: TNotification = 'new'

  get name() {
    return t(`QUEST-${shortenObjectId(this._id)}-NAME`, { ns: 'quests' })
  }

  get description() {
    return t(`QUEST-${shortenObjectId(this._id)}-DESC`, { ns: 'quests' })
  }

  @computed get completed() {
    for (let i = 0; i < this.objectives.length; i++) {
      if (!this.objectives[i].completed) {
        return false
      }
    }

    return true
  }

  @computed get incompleteObjectives() {
    return this.objectives.filter(objective => !objective.completed)
  }

  @computed get visibleObjectives() {
    const { objectives } = this

    return objectives.filter(objective => {
      const parent = objective.parent && objectives.find(o => o._id === objective.parent)

      return !!((objective.parent && parent && parent.completed) || !objective.parent)
    })
  }

  @computed get ongoingObjectives() {
    return this.visibleObjectives.filter(objective => !objective.completed)
  }

  @action evaluateStatus = () => {
    if (this.completed) return

    let evaluate = false

    this.incompleteObjectives.forEach(objective => {
      if (objective.conditions.length) {
        const parent = objective.parent && this.objectives.find(o => o._id === objective.parent)

        if (
          ((parent && parent.completed) || !objective.parent) &&
          this._game.passesConditions(objective.conditions)
        ) {
          this.completeObjective(objective)
          evaluate = true
        }
      } else if (objective.completed && !objective.conditions) {
        // We always have to evaluate objectives that have been
        // completed via an action
        evaluate = true
      }
    })

    // Rebuild the objectives if a completion status has changed.
    // This will trigger a recalculation of this.completed which is needed
    // when an objective has been completed.
    if (evaluate) {
      this.objectives = [...this.objectives]
    }
  }

  @action evaluateObjectiveUpdates = () => {
    this.objectives.forEach(objective => {
      objective.updates
        .filter(u => !u.active)
        .forEach(update => {
          if (update.conditions?.length && this._game.passesConditions(update.conditions)) {
            update.activate()
          }
        })
    })
  }

  @action completeObjective = (objective: QuestObjective) => {
    if (objective.completed) return

    objective.complete()

    // Rebuild objectives to trigger quest completion calculation
    this.objectives = [...this.objectives]
  }

  @action updateNotification = (status: TNotification = null) => {
    this.notification = status

    if (status) {
      this._game.questLog.displayNotification = true
    }
  }

  completedReaction = reaction(
    () => this.completed,
    (completed, reaction) => {
      if (completed) {
        this._game.notifications.create(
          t('QUEST-LOG-QUEST-COMPLETED-NOTIFICATION', { questName: this.name })
        )
        this.updateNotification('completed')
        this.objectives.forEach(objective => objective.updateNotification())

        analytics.event(QuestAnalyticsEvents.COMPLETED, { quest: this.name })
        reaction.dispose()
      }
    },
    { name: 'completedReaction' }
  )
}
