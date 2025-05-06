import type { ObjectSchema } from 'realm'
import type { SchemaProperties } from '../../..'
import type CharacterItem from '../../../../item/character-item'

export interface SaveDataItem extends Pick<CharacterItem, '_id' | 'uuid' | 'hasSeen' | 'usages'> {}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class SaveDataItem {
  constructor({ _id, uuid, hasSeen, usages }: CharacterItem) {
    this._id = _id
    this.uuid = uuid
    this.hasSeen = hasSeen
    this.usages = usages
  }

  static schemaProperties: SchemaProperties<SaveDataItem> = {
    _id: 'string',
    uuid: 'string',
    hasSeen: 'bool',
    usages: 'int?'
  }

  static schema: ObjectSchema = {
    name: 'SaveDataItem',
    embedded: true,
    properties: SaveDataItem.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default SaveDataItem
