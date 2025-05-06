import type { ObjectSchema } from 'realm'
import type { QuestObjective } from '../../../../quests'
import type { SchemaProperties } from '../../..'
import SaveDataQuestObjectiveUpdate from './save-data-quest-objective-update'

export interface SaveDataQuestObjective
  extends Pick<QuestObjective, '_id' | 'notification' | 'completed'> {
  updates: SaveDataQuestObjectiveUpdate[]
}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class SaveDataQuestObjective {
  constructor({ _id, notification, completed, updates }: QuestObjective) {
    this._id = _id
    this.notification = notification
    this.completed = completed
    this.updates = updates.map(ou => new SaveDataQuestObjectiveUpdate(ou))
  }

  static schemaProperties: SchemaProperties<SaveDataQuestObjective> = {
    _id: 'string',
    notification: 'string?',
    completed: 'bool',
    updates: `${SaveDataQuestObjectiveUpdate.schema.name}[]`
  }

  static schema: ObjectSchema = {
    name: 'SaveDataQuestObjective',
    embedded: true,
    properties: SaveDataQuestObjective.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default SaveDataQuestObjective
