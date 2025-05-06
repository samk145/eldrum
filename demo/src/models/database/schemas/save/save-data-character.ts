import type { ObjectSchema } from 'realm'
import type { DemoCharacter } from '../../../character/character'

import {
  SaveDataCharacter,
  type SchemaProperties,
  type ISaveDataCharacterGenerics
} from '@actnone/eldrum-engine/models'

interface IDemoSaveDataCharacterGenerics extends ISaveDataCharacterGenerics {
  Character: DemoCharacter
}

interface DemoSaveDataCharacter extends SaveDataCharacter {}

/* eslint-disable @typescript-eslint/no-extraneous-class */
class DemoSaveDataCharacter extends SaveDataCharacter<IDemoSaveDataCharacterGenerics> {
  static schemaProperties: SchemaProperties<DemoSaveDataCharacter> = {
    ...SaveDataCharacter.schemaProperties
  }

  static schema: ObjectSchema = {
    ...SaveDataCharacter.schema,
    properties: DemoSaveDataCharacter.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export { DemoSaveDataCharacter }
