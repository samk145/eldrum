import type { ObjectSchema } from 'realm'
import type { SchemaProperties } from '../../..'
import type { QuestLog } from '../../../../quests'
import SaveDataQuest from './save-data-quest'

export interface SaveDataQuestLog extends Pick<QuestLog, 'displayNotification'> {
  items: SaveDataQuest[]
}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class SaveDataQuestLog {
  constructor(questLog?: QuestLog) {
    this.displayNotification = questLog?.displayNotification || false
    this.items = questLog?.items?.map(quest => new SaveDataQuest(quest)) || []
  }

  static schemaProperties: SchemaProperties<SaveDataQuestLog> = {
    displayNotification: 'bool',
    items: `${SaveDataQuest.schema.name}[]`
  }

  static schema: ObjectSchema = {
    name: 'SaveDataQuestLog',
    embedded: true,
    properties: SaveDataQuestLog.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default SaveDataQuestLog
