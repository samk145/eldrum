import type { ObjectSchema } from 'realm'
import type Variable from '../../../../variables/variable'
import type { SchemaProperties } from '../../..'

export interface SaveDataVariable extends Pick<Variable, '_id' | 'type' | 'value'> {}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class SaveDataVariable {
  constructor(variable: SaveDataVariable) {
    this._id = variable._id
    this.type = variable.type
    this.value = variable.value
  }

  static schemaProperties: SchemaProperties<SaveDataVariable> = {
    _id: 'string',
    type: 'string',
    value: 'mixed'
  }

  static schema: ObjectSchema = {
    name: 'SaveDataVariable',
    embedded: true,
    properties: SaveDataVariable.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default SaveDataVariable
