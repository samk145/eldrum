import type { ObjectSchema } from 'realm'
import type ContentTestTask from '../../../../inspector/content-test/content-test-task'
import type { SchemaProperties } from '../../..'
import SaveDataTestTaskStep from './save-data-test-task-step'

export interface SaveDataTestTask extends Pick<ContentTestTask, '_id'> {
  steps: SaveDataTestTaskStep[]
}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class SaveDataTestTask {
  constructor({ _id, steps }: ContentTestTask) {
    this._id = _id
    this.steps = steps.map(step => new SaveDataTestTaskStep(step))
  }

  static schemaProperties: SchemaProperties<SaveDataTestTask> = {
    _id: 'string',
    steps: `${SaveDataTestTaskStep.schema.name}[]`
  }

  static schema: ObjectSchema = {
    name: 'SaveDataTestTask',
    embedded: true,
    properties: SaveDataTestTask.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default SaveDataTestTask
