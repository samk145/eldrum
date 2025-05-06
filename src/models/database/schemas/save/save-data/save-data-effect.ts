import type { ObjectSchema } from 'realm'
import type { Effect } from '../../../../character/effect'
import type { SchemaProperties } from '../../..'

export interface SaveDataEffect extends Pick<Effect, 'id' | 'uses'> {}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class SaveDataEffect {
  constructor({ id, uses }: Effect) {
    this.id = id
    this.uses = uses
  }

  static schemaProperties: SchemaProperties<SaveDataEffect> = {
    id: 'string',
    uses: 'int'
  }

  static schema: ObjectSchema = {
    name: 'SaveDataEffect',
    embedded: true,
    properties: SaveDataEffect.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default SaveDataEffect
