import type { ObjectSchema } from 'realm'
import type ContentTest from '../../../../inspector/content-test/content-test'
import type { SchemaProperties } from '../../..'
import SaveDataTestTask from './save-data-test-task'

export interface SaveDataTest extends Pick<ContentTest, '_id'> {
  tasks: SaveDataTestTask[]
}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class SaveDataTest {
  constructor({ _id, tasks }: ContentTest) {
    this._id = _id
    this.tasks = tasks.map(task => new SaveDataTestTask(task))
  }

  static schemaProperties: SchemaProperties<SaveDataTest> = {
    _id: 'string',
    tasks: `${SaveDataTestTask.schema.name}[]`
  }

  static schema: ObjectSchema = {
    name: 'SaveDataTest',
    embedded: true,
    properties: SaveDataTest.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default SaveDataTest
