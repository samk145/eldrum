import type { ObjectSchema } from 'realm'
import type Scene from '../../../../scene/scene'
import type { SchemaProperties } from '../../..'
import type Npc from '../../../../character/npc'
import SaveDataNpc from './save-data-npc'
import SaveDataSceneHistory from './save-data-scene-history'

export interface SaveDataScene extends Pick<Scene, 'nodeId' | 'stateEncounter' | 'previousNodeId'> {
  history: SaveDataSceneHistory[]
  npcs: SaveDataNpc[]
}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class SaveDataScene {
  constructor(scene?: Scene, npcs?: Npc[]) {
    this.history = scene?.history?.map(history => new SaveDataSceneHistory(history)) || []
    this.nodeId = scene?.nodeId || null
    this.previousNodeId = scene?.previousNodeId || null
    this.stateEncounter = scene?.stateEncounter || null
    this.npcs = npcs?.map(npc => new SaveDataNpc(npc)) || []
  }

  static schemaProperties: SchemaProperties<SaveDataScene> = {
    history: `${SaveDataSceneHistory.schema.name}[]`,
    nodeId: 'string?',
    stateEncounter: 'string?',
    previousNodeId: 'string?',
    npcs: `${SaveDataNpc.schema.name}[]`
  }

  static schema: ObjectSchema = {
    name: 'SaveDataScene',
    embedded: true,
    properties: SaveDataScene.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default SaveDataScene
