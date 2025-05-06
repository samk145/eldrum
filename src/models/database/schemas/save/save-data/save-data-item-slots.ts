import type { ObjectSchema } from 'realm'
import type { SchemaProperties } from '../../..'
import { type TItemSlots } from '../../../../character/inventory'

export interface SaveDataItemSlots extends TItemSlots {}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class SaveDataItemSlots {
  constructor(itemSlots?: TItemSlots) {
    Object.assign(this, itemSlots)
  }

  static schemaProperties: SchemaProperties<SaveDataItemSlots> = {
    head: 'string?',
    accessory: 'string?',
    body: 'string?',
    feet: 'string?',
    hands: 'string?',
    mainHand: 'string?',
    offHand: 'string?',
    ornament: 'string?'
  }

  static schema: ObjectSchema = {
    name: 'SaveDataItemSlots',
    embedded: true,
    properties: SaveDataItemSlots.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default SaveDataItemSlots
