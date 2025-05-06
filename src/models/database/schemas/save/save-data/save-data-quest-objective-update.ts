import type { ObjectSchema } from 'realm'
import type { SchemaProperties } from '../../..'
import type { Update } from '../../../../quests'

export interface SaveDataQuestObjectiveUpdate
  extends Pick<Update, '_id' | 'activatedAt' | 'active'> {}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class SaveDataQuestObjectiveUpdate {
  constructor({ _id, activatedAt, active }: Update) {
    this._id = _id
    this.activatedAt = activatedAt
    this.active = active
  }

  static schemaProperties: SchemaProperties<SaveDataQuestObjectiveUpdate> = {
    _id: 'string',
    activatedAt: 'int?',
    active: 'bool'
  }

  static schema: ObjectSchema = {
    name: 'SaveDataQuestObjectiveUpdate',
    embedded: true,
    properties: SaveDataQuestObjectiveUpdate.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default SaveDataQuestObjectiveUpdate
