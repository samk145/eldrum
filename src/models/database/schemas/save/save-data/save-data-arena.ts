import { type ObjectSchema } from 'realm'
import type { SchemaProperties } from '../../..'
import type { Arena } from '../../../../arena'
import SaveDataArenaChallenge from './save-data-arena-challenge'

export interface SaveDataArena {
  currentTier: number
  challenges: SaveDataArenaChallenge[]
}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class SaveDataArena {
  constructor(arena?: Arena) {
    this.currentTier = arena?.currentTier || 1
    this.challenges = arena?.currentTierChallenges
      ? arena.currentTierChallenges.map(challenge => new SaveDataArenaChallenge(challenge))
      : []
  }

  static schemaProperties: SchemaProperties<SaveDataArena> = {
    currentTier: 'int',
    challenges: `${SaveDataArenaChallenge.schema.name}[]`
  }

  static schema: ObjectSchema = {
    name: 'SaveDataArena',
    embedded: true,
    properties: SaveDataArena.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default SaveDataArena
