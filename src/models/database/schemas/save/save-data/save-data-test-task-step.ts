import type { ObjectSchema } from 'realm'
import type ContentTestTaskStep from '../../../../inspector/content-test/content-test-task-step'
import type { SchemaProperties } from '../../..'

export interface SaveDataTestTaskStep extends Pick<ContentTestTaskStep, '_id'> {
  completed: boolean
}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class SaveDataTestTaskStep {
  constructor({ _id, completed }: ContentTestTaskStep) {
    this._id = _id
    this.completed = completed
  }

  static schemaProperties: SchemaProperties<SaveDataTestTaskStep> = {
    _id: 'string',
    completed: 'bool'
  }

  static schema: ObjectSchema = {
    name: 'SaveDataTestTaskStep',
    embedded: true,
    properties: SaveDataTestTaskStep.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default SaveDataTestTaskStep
