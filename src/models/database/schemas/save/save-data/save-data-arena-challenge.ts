import { type ObjectSchema } from 'realm'
import type { SchemaProperties } from '../../..'
import type { ArenaChallenge } from '../../../../arena'

export interface SaveDataArenaChallenge extends Pick<ArenaChallenge, '_id'> {
  defeated: boolean | null
}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class SaveDataArenaChallenge {
  constructor(challenge: ArenaChallenge) {
    this._id = challenge._id
    this.defeated = challenge.defeated ?? null
  }

  static schemaProperties: SchemaProperties<SaveDataArenaChallenge> = {
    _id: 'string',
    defeated: 'bool?'
  }

  static schema: ObjectSchema = {
    name: 'SaveDataArenaChallenge',
    embedded: true,
    properties: SaveDataArenaChallenge.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default SaveDataArenaChallenge
