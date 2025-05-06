import type { EditorSettings } from '@actnone/eldrum-editor/dist/types'
import type { ObjectSchema } from 'realm'
import type { SchemaProperties } from '../../..'
import type Movement from '../../../../movement'

export interface SaveDataMovement
  extends Pick<
    Movement,
    'pendingLocationId' | 'currentPathId' | 'pathEncounterId' | 'locationId'
  > {}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class SaveDataMovement {
  constructor(movement?: Movement, defaultMovement?: EditorSettings['defaultData']['movement']) {
    if (!movement?.locationId && !defaultMovement?.location) {
      throw new Error(
        'No location data found in Game data and no default location provided in content settings'
      )
    }

    this.locationId = (movement?.locationId || defaultMovement?.location)!
    this.pendingLocationId = movement?.pendingLocationId || null
    this.currentPathId = movement?.currentPathId || null
    this.pathEncounterId = movement?.pathEncounterId || null
  }

  static schemaProperties: SchemaProperties<SaveDataMovement> = {
    locationId: 'string',
    pendingLocationId: 'string?',
    currentPathId: 'string?',
    pathEncounterId: 'string?'
  }

  static schema: ObjectSchema = {
    name: 'SaveDataMovement',
    embedded: true,
    properties: SaveDataMovement.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default SaveDataMovement
