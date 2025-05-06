import type { ObjectSchema } from 'realm'
import type { EditorSettings } from '@actnone/eldrum-editor/dist/types'
import type CharacterItem from '../../../../item/character-item'
import type Character from '../../../../character/character'
import type { Mutable } from '../../../../../helpers/type-helpers'
import type { SchemaProperties } from '../../..'
import { logger } from '../../../../../helpers/logger'
import SaveDataEffect from './save-data-effect'
import SaveDataItem from './save-data-item'
import SaveDataItemSlots from './save-data-item-slots'

type OriginalTypes = Pick<
  Character,
  'level' | 'experience' | 'unspentStatPoints' | 'health' | 'gold' | 'displayItemNotification'
> &
  Pick<
    Mutable<Character>,
    'baseStrength' | 'baseCharisma' | 'baseResilience' | 'baseAgility' | 'basePerception'
  >

export interface ISaveDataCharacterGenerics {
  Character: Character
}

export interface SaveDataCharacter extends OriginalTypes {
  itemSlots?: SaveDataItemSlots
  inventory: SaveDataItem[]
  effects: SaveDataEffect[]
}

/* eslint-disable @typescript-eslint/no-extraneous-class */
export class SaveDataCharacter<G extends ISaveDataCharacterGenerics = ISaveDataCharacterGenerics> {
  constructor(
    character?: G['Character'],
    defaultCharacter?: EditorSettings['defaultData']['character']
  ) {
    if (!(character || defaultCharacter)) {
      logger.error(
        new Error(`No character data found in Game data or in content settings' defaultData.`)
      )
    }

    this.level = character?.level || 1
    this.experience = character?.experience || 0
    this.unspentStatPoints = character?.unspentStatPoints || 0
    this.health = character?.health || 0
    this.baseStrength = character?.baseStrength || defaultCharacter?.strength || 1
    this.baseCharisma = character?.baseCharisma || defaultCharacter?.charisma || 1
    this.baseResilience = character?.baseResilience || defaultCharacter?.resilience || 1
    this.baseAgility = character?.baseAgility || defaultCharacter?.agility || 1
    this.basePerception = character?.basePerception || defaultCharacter?.perception || 1
    this.gold = character?.gold || 0
    this.displayItemNotification = character?.displayItemNotification || false
    this.itemSlots = new SaveDataItemSlots(character?.inventory.itemSlots) || undefined
    this.inventory =
      character?.inventory.items.map((item: CharacterItem) => new SaveDataItem(item)) || []
    this.effects = character?.effects?.list.map(effect => new SaveDataEffect(effect)) || []
  }

  static schemaProperties: SchemaProperties<SaveDataCharacter> = {
    level: 'int',
    experience: 'int',
    unspentStatPoints: 'int',
    health: 'int',
    baseStrength: 'int',
    baseCharisma: 'int',
    baseResilience: 'int',
    baseAgility: 'int',
    basePerception: 'int',
    gold: 'int',
    displayItemNotification: 'bool',
    itemSlots: `${SaveDataItemSlots.schema.name}`,
    inventory: `${SaveDataItem.schema.name}[]`,
    effects: `${SaveDataEffect.schema.name}[]`
  }

  static schema: ObjectSchema = {
    name: 'SaveDataCharacter',
    embedded: true,
    properties: SaveDataCharacter.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default SaveDataCharacter
