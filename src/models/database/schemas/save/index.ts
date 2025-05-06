import type { ObjectSchema } from 'realm'
import type { TResources } from '../../../../stores/content'
import type Game from '../../../game'
import type { ISchemaClass, SchemaProperties } from '../..'

import { uuid } from '../../../../helpers/misc'
import { SaveData } from './save-data'

export enum SaveType {
  manual = 'manual',
  auto = 'auto',
  stash = 'stash',
  ephemeral = 'ephemeral'
}

export interface ISaveGenerics {
  Game: Game
  SaveData: SaveData
}

export interface Save extends ISchemaClass {}

export class Save<G extends ISaveGenerics = ISaveGenerics> {
  constructor({
    id,
    game,
    timeSpent,
    timestamp,
    type
  }: {
    id?: string | undefined
    game?: G['Game']
    timeSpent?: Save['timeSpent']
    timestamp?: Save['timestamp']
    type: SaveType
  }) {
    this.id = id || uuid()
    this.saveData = game ? this.saveDataFactory(game) : null
    this.type = type
    this.backgroundImage = game?.puppeteer.backgroundImage || undefined
    this.timeSpent = timeSpent || 0
    this.timestamp = timestamp || Date.now()
  }

  id: string
  type: SaveType
  saveData: G['SaveData'] | null
  backgroundImage?: string
  timeSpent: number
  timestamp: number

  saveDataFactory(data?: G['Game'], content?: TResources): G['SaveData'] {
    return new SaveData(data, content)
  }

  static schemaProperties: Omit<SchemaProperties<Save>, 'saveDataFactory'> = {
    id: 'string',
    type: 'string',
    backgroundImage: 'string?',
    timeSpent: 'int',
    timestamp: 'int',
    saveData: `${SaveData.schema.name}?`
  }

  static schema: ObjectSchema = {
    name: 'Save',
    primaryKey: 'id',
    properties: Save.schemaProperties
  }
}

export default Save
