import type { ObjectSchema } from 'realm'
import type { SchemaProperties } from '../../..'
import type Inspector from '../../../../inspector/inspector'
import SaveDataTest from './save-data-test'

export interface SaveDataInspector {
  test: SaveDataTest | null
}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class SaveDataInspector {
  constructor(inspector?: Inspector) {
    this.test = inspector?.test ? new SaveDataTest(inspector.test) : null
  }

  static schemaProperties: SchemaProperties<SaveDataInspector> = {
    test: SaveDataTest.schema.name
  }

  static schema: ObjectSchema = {
    name: 'SaveDataInspector',
    embedded: true,
    properties: SaveDataInspector.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default SaveDataInspector
