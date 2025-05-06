import type { ObjectSchema } from 'realm'
import type { SchemaProperties } from '../../..'
import type Npc from '../../../../character/npc'
import SaveDataEffect from './save-data-effect'

export interface SaveDataNpc extends Pick<Npc, '_id' | 'health'> {
  effects: SaveDataEffect[]
}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class SaveDataNpc {
  constructor({ _id, health, effects }: Npc) {
    this._id = _id
    this.health = health
    this.effects = effects.list.map(effect => new SaveDataEffect(effect))
  }

  static schemaProperties: SchemaProperties<SaveDataNpc> = {
    _id: 'string',
    health: 'int',
    effects: `${SaveDataEffect.schema.name}[]`
  }

  static schema: ObjectSchema = {
    name: 'SaveDataNpc',
    embedded: true,
    properties: SaveDataNpc.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default SaveDataNpc
