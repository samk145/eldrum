import type { EditorItem } from '@actnone/eldrum-editor/dist/types'
import type SaveDataItem from '../database/schemas/save/save-data/save-data-item'
import type Character from '../character/character'
import type { Entries } from 'type-fest'
import type { Slot } from '../character/inventory'

import { observable, computed } from 'mobx'
import { uuid } from '../../helpers/misc'
import Item from './item'

export interface ICharacterItemGenerics {
  Character: Character
}

export class CharacterItem<G extends ICharacterItemGenerics = ICharacterItemGenerics> extends Item {
  constructor(
    private readonly character: G['Character'],
    defaultProps: EditorItem,
    storedProps: Partial<SaveDataItem>
  ) {
    super(defaultProps, storedProps)

    if ('consumption' in defaultProps && defaultProps.consumption.uses) {
      const { uses } = defaultProps.consumption
      // We need to reassign it (despite it being assigned in the super constructor)
      // Because default value 0 should only be assigned if it is a CharacterItem
      this.usages = storedProps?.usages || 0

      if (storedProps?.usages) {
        // Make sure the stored usage isn't higher than the default usage.
        // If it is, we'll reset it to default. This is needed in case
        // the item has been changed and the max usages altered.
        if (storedProps.usages >= uses) {
          // Keep one, otherwise the item would've been consumed.
          this.usages = uses - 1
        }
      }
    }

    if (!this.uuid) {
      this.uuid = uuid()
    }
  }

  @observable hasSeen = false
  /**
   * This property's value is increased every time the Player uses the item.
   * When `item.usages >= item.consumption.uses` item is fully consumed (removed
   * from inventory)
   */
  @observable usages?: number

  @computed get equipped() {
    return !!this.character.inventory.equippedItems.find(item => item.uuid === this.uuid)
  }

  getEquippedInSlots() {
    const itemSlots = this.character.inventory.itemSlots
    const equippedInSlots = (Object.entries(itemSlots) as Entries<typeof itemSlots>).reduce(
      (slotNames: Slot[], [slotName, itemUUID]) => {
        if (itemUUID === this.uuid) {
          slotNames.push(slotName)
        }

        return slotNames
      },
      []
    )

    return equippedInSlots
  }

  @computed get equippedInSlotSetIndex() {
    if (!this.equipped) {
      return null
    }

    const equippedInSlots = this.getEquippedInSlots()

    const index = this.slotSets?.findIndex(slotSet =>
      slotSet.every(slotName => equippedInSlots.includes(slotName))
    )

    return index !== undefined && index > -1 ? index : null
  }

  @computed get equippedInSlotSet() {
    return this.equipped && this.slotSets && this.equippedInSlotSetIndex !== null
      ? this.slotSets[this.equippedInSlotSetIndex]
      : null
  }

  get equippable() {
    return !!(this.slotSets && this.slotSets.length > 0)
  }

  get canEquip() {
    return (
      !this.equipped &&
      this.character.stats.maxEncumbrance.value >= this.character.encumbrance + this.encumbrance
    )
  }

  @computed get consumable() {
    return !!this.consumption?.actions
  }

  @computed get defaultSlots() {
    return this.slotSets ? this.slotSets[0] : []
  }
}

export default CharacterItem
