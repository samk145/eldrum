import type SaveDataQuestObjective from '../database/schemas/save/save-data/save-data-quest-objective'
import type SaveDataQuestObjectiveUpdate from '../database/schemas/save/save-data/save-data-quest-objective-update'
import type {
  EditorQuestObjective,
  EditorQuestObjectiveUpdate
} from '@actnone/eldrum-editor/dist/types'
import type { Quest, TNotification } from './quest'

import { observable, action } from 'mobx'
import { t } from '../../i18n'
import { analytics } from '../../helpers/analytics'
import { shortenObjectId } from '../../helpers/misc'

export enum QuestAnalyticsEvents {
  COMPLETED = 'Quest Objective Completed'
}

export class Update {
  constructor(
    private readonly _objective: QuestObjective,
    defaultProps: EditorQuestObjectiveUpdate,
    storedProps?: SaveDataQuestObjectiveUpdate
  ) {
    this._id = defaultProps._id
    this.conditions = defaultProps.conditions

    if (storedProps) {
      Object.assign(this, storedProps)
    }
  }

  _id: string
  @observable activatedAt?: number
  @observable active = false
  conditions: EditorQuestObjectiveUpdate['conditions']

  get description() {
    return t(
      `QUEST-${shortenObjectId(this._objective._quest._id)}-OBJ-${shortenObjectId(this._objective._id)}-UPDATE-${shortenObjectId(this._id)}-DESC`,
      {
        ns: 'quests'
      }
    )
  }

  @action activate = () => {
    this.active = true
    this.activatedAt = Date.now()

    this._objective.updateNotification('updated')
  }
}

export class QuestObjective {
  constructor(
    readonly _quest: Quest,
    defaultProps: EditorQuestObjective,
    storedProps?: SaveDataQuestObjective
  ) {
    this._id = defaultProps._id
    this.conditions = defaultProps.conditions
    this.experience = defaultProps.experience
    this.parent = defaultProps.parent

    if (storedProps) {
      Object.assign(this, storedProps)
    }

    this.updates = defaultProps.updates.map(update => {
      const storedUpdateProps = storedProps?.updates
        ? storedProps.updates.find(o => o._id === update._id)
        : undefined
      return new Update(this, update, storedUpdateProps)
    })
  }

  _id: string
  conditions: EditorQuestObjective['conditions']
  experience: number
  parent: string
  updates: Update[]
  @observable completed = false
  @observable notification: TNotification = null

  get title() {
    return t(`QUEST-${shortenObjectId(this._quest._id)}-OBJ-${shortenObjectId(this._id)}-TITLE`, {
      ns: 'quests'
    })
  }

  get description() {
    return t(`QUEST-${shortenObjectId(this._quest._id)}-OBJ-${shortenObjectId(this._id)}-DESC`, {
      ns: 'quests'
    })
  }

  @action updateNotification = (status: TNotification = null) => {
    this.notification = status

    if (status) {
      this._quest.updateNotification('updated')
    }
  }

  @action complete = () => {
    this.completed = true
    this.updateNotification('completed')
    if (this.experience) {
      this._quest._game.character.gainExperience(this.experience)
    }
    this._quest._game.notifications.create(
      t('QUEST-LOG-OBJECTIVE-COMPLETED-NOTIFICATION', { objectiveName: this.title })
    )

    analytics.event(QuestAnalyticsEvents.COMPLETED, { title: this.title })
  }
}
