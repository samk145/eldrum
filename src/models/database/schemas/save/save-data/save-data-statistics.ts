import { type ObjectSchema } from 'realm'
import type Statistics from '../../../../statistics'
import type { SchemaProperties } from '../../..'

export interface SaveDataStatistics {
  usedOptions: Record<string, number>
  usedMovementOptions: Record<string, number>
  usedPaths: Record<string, number>
  seenPathEncounters: Record<string, number>
  seenNodes: Record<string, number>
  seenScenes: Record<string, number>
  seenLocations: Record<string, number>
  seenAreas: Record<string, number>
  seenOptionOutcomes: Record<string, number>
  defeatedNpcsInCombat: Record<string, number>
  killedNpcsInCombat: Record<string, number>
  gainedItems: Record<string, number>
  consumedItems: Record<string, number>
  seenMedia: Record<string, boolean>
  openedScriptures: Record<string, boolean>
  lastSeenNode: string | null
  lastSeenScene: string | null
  lastSeenArea: string | null
  lastSeenLocation: string | null
  lastUsedOption: string | null
  lastUsedMovementOption: string | null
  wonLastCombat: boolean | null
}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class SaveDataStatistics {
  constructor(statistics?: Statistics) {
    this.usedOptions = statistics?.usedOptions.toJSON() || {}
    this.usedMovementOptions = statistics?.usedMovementOptions.toJSON() || {}
    this.usedPaths = statistics?.usedPaths.toJSON() || {}
    this.seenPathEncounters = statistics?.seenPathEncounters.toJSON() || {}
    this.seenNodes = statistics?.seenNodes.toJSON() || {}
    this.seenScenes = statistics?.seenScenes.toJSON() || {}
    this.seenLocations = statistics?.seenLocations.toJSON() || {}
    this.seenAreas = statistics?.seenAreas.toJSON() || {}
    this.seenOptionOutcomes = statistics?.seenOptionOutcomes.toJSON() || {}
    this.gainedItems = statistics?.gainedItems.toJSON() || {}
    this.consumedItems = statistics?.consumedItems.toJSON() || {}
    this.defeatedNpcsInCombat = statistics?.defeatedNpcsInCombat.toJSON() || {}
    this.killedNpcsInCombat = statistics?.killedNpcsInCombat.toJSON() || {}
    this.seenMedia = statistics?.seenMedia.toJSON() || {}
    this.openedScriptures = statistics?.openedScriptures.toJSON() || {}
    this.lastSeenArea = statistics?.lastSeenArea.get() || null
    this.lastSeenLocation = statistics?.lastSeenLocation.get() || null
    this.lastSeenScene = statistics?.lastSeenScene.get() || null
    this.lastSeenNode = statistics?.lastSeenNode.get() || null
    this.lastUsedOption = statistics?.lastUsedOption.get() || null
    this.lastUsedMovementOption = statistics?.lastUsedMovementOption.get() || null
    this.wonLastCombat = statistics?.wonLastCombat || null
  }

  static schemaProperties: SchemaProperties<SaveDataStatistics> = {
    usedOptions: 'mixed{}',
    usedMovementOptions: 'mixed{}',
    usedPaths: 'mixed{}',
    seenPathEncounters: 'mixed{}',
    seenNodes: 'mixed{}',
    seenScenes: 'mixed{}',
    seenLocations: 'mixed{}',
    seenAreas: 'mixed{}',
    seenOptionOutcomes: 'mixed{}',
    defeatedNpcsInCombat: 'mixed{}',
    killedNpcsInCombat: 'mixed{}',
    gainedItems: 'mixed{}',
    consumedItems: 'mixed{}',
    seenMedia: 'bool{}',
    openedScriptures: 'bool{}',
    lastSeenArea: 'string?',
    lastSeenLocation: 'string?',
    lastSeenScene: 'string?',
    lastSeenNode: 'string?',
    lastUsedOption: 'string?',
    lastUsedMovementOption: 'string?',
    wonLastCombat: 'bool?'
  }

  static schema: ObjectSchema = {
    name: 'SaveDataStatistics',
    embedded: true,
    properties: this.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default SaveDataStatistics
