import type { ObjectSchema } from 'realm'
import type { SceneHistory } from '../../../../scene/history'
import type { SchemaProperties } from '../../..'

export interface SaveDataSceneHistory extends SceneHistory {}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class SaveDataSceneHistory {
  constructor({ narrativeTranslationKeys }: SceneHistory) {
    this.narrativeTranslationKeys = narrativeTranslationKeys
  }

  static schemaProperties: SchemaProperties<SaveDataSceneHistory> = {
    narrativeTranslationKeys: 'string[]'
  }

  static schema: ObjectSchema = {
    name: 'SaveDataSceneHistory',
    embedded: true,
    properties: SaveDataSceneHistory.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default SaveDataSceneHistory
