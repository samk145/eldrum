import type { ObjectSchema } from 'realm'
import type { EditorSettings } from '@actnone/eldrum-editor/dist/types'
import type Game from '../../../../game'
import type { SchemaProperties } from '../../..'
import type { TResources } from '../../../../../stores/content'
import { uuid } from '../../../../../helpers/misc'
import SaveDataCharacter from './save-data-character'
import SaveDataInspector from './save-data-inspector'
import SaveDataMovement from './save-data-movement'
import SaveDataQuestLog from './save-data-quest-log'
import SaveDataScene from './save-data-scene'
import SaveDataStatistics from './save-data-statistics'
import SaveDataVariables from './save-data-variables'

export interface ISaveDataGenerics {
  Game: Game
  SaveDataCharacter: SaveDataCharacter
}

interface SaveData {
  _id: string
  startDate: number | null
  movement: SaveDataMovement
  scene: SaveDataScene
  questLog: SaveDataQuestLog
  variables: SaveDataVariables
  statistics: SaveDataStatistics
  inspector?: SaveDataInspector
}

/* eslint-disable @typescript-eslint/no-extraneous-class */
class SaveData<G extends ISaveDataGenerics = ISaveDataGenerics> {
  constructor(data?: G['Game'], content?: TResources) {
    const defaultData = content?.settings?.defaultData || null

    this._id = data?._id || uuid()
    this.startDate = data?.startDate || null
    this.movement = new SaveDataMovement(data?.movement, defaultData?.movement)
    this.scene = new SaveDataScene(data?.scene, data?.actors.npcs)
    this.character = this.characterFactory(data?.character, defaultData?.character)
    this.questLog = new SaveDataQuestLog(data?.questLog)
    this.variables = new SaveDataVariables(data?.variables)
    this.statistics = new SaveDataStatistics(data?.statistics)

    if (data?.inspector) {
      this.inspector = new SaveDataInspector(data.inspector)
    }
  }

  character: G['SaveDataCharacter']

  characterFactory(
    character?: G['Game']['character'],
    defaultData?: EditorSettings['defaultData']['character']
  ): G['SaveDataCharacter'] {
    return new SaveDataCharacter(character, defaultData)
  }

  static schemaProperties: Omit<SchemaProperties<SaveData>, 'characterFactory'> = {
    _id: 'string',
    startDate: 'int?',
    movement: `${SaveDataMovement.schema.name}`,
    scene: `${SaveDataScene.schema.name}`,
    character: `${SaveDataCharacter.schema.name}`,
    questLog: `${SaveDataQuestLog.schema.name}`,
    variables: `${SaveDataVariables.schema.name}`,
    statistics: `${SaveDataStatistics.schema.name}`,
    inspector: `${SaveDataInspector.schema.name}?`
  }

  static schema: ObjectSchema = {
    name: 'SaveData' as const,
    embedded: true,
    properties: SaveData.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export { SaveData }
export default SaveData
