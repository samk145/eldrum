import type { ObjectSchema } from 'realm'
import type { Quest } from '../../../../quests/quest'
import type { SchemaProperties } from '../../..'
import SaveDataQuestObjective from './save-data-quest-objective'

export interface SaveDataQuest extends Pick<Quest, '_id' | 'notification'> {
  objectives: SaveDataQuestObjective[]
}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class SaveDataQuest {
  constructor({ _id, notification, objectives }: Quest) {
    this._id = _id
    this.notification = notification
    this.objectives = objectives.map(objective => new SaveDataQuestObjective(objective))
  }

  static schemaProperties: SchemaProperties<SaveDataQuest> = {
    _id: 'string',
    notification: 'string?',
    objectives: `${SaveDataQuestObjective.schema.name}[]`
  }

  static schema: ObjectSchema = {
    name: 'SaveDataQuest',
    embedded: true,
    properties: SaveDataQuest.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default SaveDataQuest
