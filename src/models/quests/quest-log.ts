import type Game from '../game'
import type { QuestObjective } from './quest-objective'

import { observable, computed, action } from 'mobx'
import { t } from '../../i18n'
import { Quest } from './quest'
import { logger } from '../../helpers/logger'

export class QuestLog {
  constructor(private readonly _game: Game) {
    this.items = []

    _game._default.questLog.items.forEach(quest => {
      const defaultProps = this._game.getEntity('quests', quest._id)
      this.items.push(new Quest(_game, defaultProps, quest))
    })

    this.displayNotification = this._game._default.questLog.displayNotification
  }

  @observable items: Quest[]
  @observable displayNotification: boolean

  @computed get ongoingQuests() {
    return this.items.filter(quest => !quest.completed)
  }

  @computed get completedQuests() {
    return this.items.filter(quest => quest.completed)
  }

  @computed get visibleObjectives() {
    return this.ongoingQuests.reduce(
      (total: QuestObjective[], quest) => [...total, ...quest.visibleObjectives],
      []
    )
  }

  @computed get ongoingObjectives() {
    return this.ongoingQuests.reduce(
      (total: QuestObjective[], quest) => [...total, ...quest.ongoingObjectives],
      []
    )
  }

  @action initiateQuest = (id: string) => {
    if (this.getQuest(id)) return

    const questData = this._game.getEntity('quests', id)
    const quest = new Quest(this._game, questData)

    this.items.push(quest)

    this._game.notifications.create(
      t('QUEST-LOG-QUEST-START-NOTIFICATION', { questName: quest.name })
    )
    this.displayNotification = true
  }

  @action removeQuest = (id: string) => {
    const index = this.items.findIndex(quest => quest._id === id)

    if (index > -1) {
      return this.items.pop()
    }
  }

  getQuest = (id: string) => {
    return this.items.find(quest => quest._id === id)
  }

  @action completeQuest = (id: string) => {
    const quest = this.getQuest(id)

    if (!quest) {
      logger.info(`A quest with id ${id} failed completion because it wasn't found.`)
    } else {
      quest.objectives.forEach(objective => (objective.completed = true))
      this.displayNotification = true
    }
  }

  @action completeObjective = (questId: string, objectiveId: string) => {
    const quest = this.getQuest(questId)
    const objective = quest?.objectives.find(objective => objective._id === objectiveId) || null

    if (!objective) {
      logger.info(
        `A quest objective with id ${objectiveId} failed completion because it wasnt found.`
      )
    } else if (quest) {
      quest.completeObjective(objective)
      this.displayNotification = true
    }
  }

  @action activateQuestObjectiveUpdate = (
    questId: string,
    objectiveId: string,
    updateId: string
  ) => {
    const objective = this.getQuestObjective(questId, objectiveId)
    const update = objective?.updates.find(update => update._id === updateId) || null

    if (!update) {
      logger.info(
        `A quest objective update with id ${updateId} failed to become visible because it wasnt found.`
      )
    } else {
      update.activate()
    }
  }

  @action evaluateQuests = () => {
    this.evaluateQuestStatus()
    this.evaluateQuestObjectiveUpdates()
  }

  @action evaluateQuestStatus = () => {
    this.items.forEach(quest => quest.evaluateStatus())
  }

  @action evaluateQuestObjectiveUpdates = () => {
    this.items.forEach(quest => quest.evaluateObjectiveUpdates())
  }

  @action hideNotification = () => {
    this.displayNotification = false
  }

  hasCompletedQuest = (id: string) => {
    const quest = this.getQuest(id)

    return !!(quest && quest.completed)
  }

  hasCompletedObjective = (questId: string, objectiveId: string) => {
    const objective = this.getQuestObjective(questId, objectiveId)

    return !!(objective && objective.completed)
  }

  hasActivatedQuestObjectiveUpdate = (questId: string, objectiveId: string, updateId: string) => {
    const objective = this.getQuestObjective(questId, objectiveId)
    const update = objective?.updates.find(update => update._id === updateId) || null

    return !!(update && update.active)
  }

  getQuestObjective = (questId: string, objectiveId: string) => {
    const quest = this.getQuest(questId)
    const objective = quest?.objectives.find(objective => objective._id === objectiveId) || null

    return objective
  }
}
