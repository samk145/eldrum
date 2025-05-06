import { type ObjectSchema } from 'realm'
import type { SchemaProperties } from '../../..'
import SaveDataVariable from './save-data-variable'

export interface SaveDataVariables {
  list: SaveDataVariable[]
}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class SaveDataVariables {
  constructor(variables?: SaveDataVariables) {
    this.list =
      variables?.list.map(variableFromGame => new SaveDataVariable(variableFromGame)) || []
  }

  static schemaProperties: SchemaProperties<SaveDataVariables> = {
    list: `${SaveDataVariable.schema.name}[]`
  }

  static schema: ObjectSchema = {
    name: 'SaveDataVariables',
    embedded: true,
    properties: SaveDataVariables.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default SaveDataVariables
