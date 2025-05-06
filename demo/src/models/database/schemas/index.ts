import { schemas as baseSchemas } from '@actnone/eldrum-engine/models'
import { DemoSave, DemoSaveData, DemoSaveDataCharacter } from './save'

const demoSchemaOverrides = [DemoSave.schema, DemoSaveData.schema, DemoSaveDataCharacter.schema]

const schemas = [
  ...baseSchemas.filter(
    schema => !demoSchemaOverrides.some(uSchema => uSchema.name === schema.name)
  ),
  ...demoSchemaOverrides
]

export { schemas }
