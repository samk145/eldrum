import type { EditorItem } from '@actnone/eldrum-editor/dist/types'
import type { ItemChange } from '../item/item'
import type { TUuid } from '../../helpers/misc'
import type Game from '../game'
import type EldrumTItem from '../item/t-item'
import type SaveDataItem from '../database/schemas/save/save-data/save-data-item'
import type CharacterItem from '../item/character-item'
import type { Character } from './character'
import { observable, action, computed } from 'mobx'
import { t } from '../../i18n'
import { logger } from '../../helpers/logger'
import { randomIntegerFromInterval } from '../../helpers/misc'

export const handSlots = ['mainHand', 'offHand'] as const

export const slots = [
  'head',
  'body',
  'hands',
  'feet',
  'accessory',
  'ornament',
  ...handSlots
] as const

export type HandSlot = (typeof handSlots)[number]
export type Slot = (typeof slots)[number]
export type TItemSlots = Record<Slot, TUuid | null>

export interface IInventoryGenerics {
  Game: Game
  CharacterItem: CharacterItem
}

export class Inventory<G extends IInventoryGenerics = IInventoryGenerics> {
  constructor(
    protected game: G['Game'],
    readonly itemFactory: (params: {
      character: Character
      defaultProps: EditorItem
      storedProps: Partial<SaveDataItem>
    }) => G['CharacterItem']
  ) {
    const storedItemSlots: Partial<TItemSlots> | undefined = game._default.character.itemSlots

    if (storedItemSlots) {
      for (const key of slots) {
        if (typeof storedItemSlots[key] === 'string') {
          const value = storedItemSlots[key]
          this.itemSlots[key] = value
        }
      }
    }
  }

  @observable items: G['CharacterItem'][] = []

  @observable itemSlots: TItemSlots = {
    head: null,
    body: null,
    hands: null,
    feet: null,
    accessory: null,
    ornament: null,
    mainHand: null,
    offHand: null
  }

  @computed get equippedItems(): G['CharacterItem'][] {
    const ids = Object.values(this.itemSlots)

    return this.items.filter(item => ids.includes(item.uuid))
  }

  /**
   * Equipped weapons
   *
   * If more than one weapon is equipped, the sorting order will be based on main hand -> off hand.
   */
  @computed get equippedWeapons() {
    return this.equippedItems
      .filter(item => item.type === 'weapon')
      .sort(itemA => (itemA.uuid === this.itemSlots.mainHand ? -1 : 0))
  }

  @computed get equippedItemsBySlot() {
    return Object.entries(this.itemSlots).map(([slotName, uuid]) => ({
      slot: slotName as Slot,
      item: this.equippedItems.find(item => item.uuid === uuid)
    }))
  }

  @computed get equippedItemsInHands() {
    return this.equippedItemsBySlot.reduce((items: G['CharacterItem'][], value) => {
      if ((Inventory.handSlots as string[]).includes(value.slot) && value.item) {
        items.push(value.item)
      }

      return items
    }, [])
  }

  /**
   * Equip item
   */
  @action equipItem(uuid: TUuid, slotsIndex: number = 0) {
    const newItem = this.items.find(item => item.uuid === uuid)

    if (!newItem?.slotSets) return

    const slotsToEquipIn = newItem.slotSets[slotsIndex]

    const currentItems = this.getEquippedItems(slotsToEquipIn)
    currentItems.forEach(item => this.unEquipItem(item.uuid))

    slotsToEquipIn.forEach(slotName => {
      this.itemSlots[slotName] = newItem.uuid
    })

    if (newItem.sideEffects?.onEquip) {
      this.game.executeActions(newItem.sideEffects.onEquip, `items:ITEM-${newItem._id}-EQUIP`)
    }

    return newItem
  }

  /**
   * Un-equip item
   */
  @action unEquipItem(uuid: TUuid) {
    const { itemSlots, game } = this

    const item = this.equippedItems.find(item => item.uuid === uuid)

    if (item?.sideEffects?.onUnEquip) {
      game.executeActions(item.sideEffects.onUnEquip, `items:ITEM-${item._id}-UNEQUIP`)
    }

    for (const slot in itemSlots) {
      if (itemSlots[slot as Slot] === uuid) {
        itemSlots[slot as Slot] = null
      }
    }

    return item
  }

  /**
   * Pick up item
   *
   * @param {string/array} ids - A single id or an array of ids
   * @param {object}  [options]
   * @param {boolean} [options.equip] - Whether or not to equip the item
   * @param {boolean} [options.notify] - Whether or not to display a notification
   * @param {number}  [options.notificationTime] - Time in milliseconds to display the notification
   */
  @action pickUpItem = (
    ids: string | string[],
    { equip = false, notify = true, notificationTime = undefined } = {}
  ) => {
    // If it's a single item, convert it to an array
    if (typeof ids !== 'object') {
      ids = [ids]
    }

    const notifications: ItemChange[] = []

    ids.forEach(id => {
      const itemData = this.game.getEntity('items', id)

      if (itemData) {
        const hasSeen = this.game.statistics.getRecord('gainedItems', id) > 0

        if (!hasSeen) {
          this.game.character.displayItemNotification = true
        }

        this.game.statistics.record('gainedItems', id)

        const item = this.itemFactory({
          character: this.game.character,
          defaultProps: itemData,
          storedProps: { hasSeen }
        })

        this.addItem(item)

        if (equip && item.equippable && item.canEquip) {
          this.equipItem(item.uuid)
        }

        if (notify) {
          this.updateItemChangeNotifications(notifications, item, 1)
        }
      } else {
        logger.warn(`No item found with id ${id}`)
      }
    })

    this.createItemChangeNotifications(notifications, notificationTime)
  }

  /**
   * Consume item
   *
   * @param {string} id - The ID of the item to consume
   */
  @action consumeItem = (id: string) => {
    const { game, getInventoryItemById, removeItemById } = this
    const item = getInventoryItemById(id)

    if (!item) {
      return logger.info(`Failed trying to consume item ${id}: None found in inventory`)
    }

    if (item.usages === undefined) {
      return logger.info(`Failed trying to consume item ${id}: Item is not consumable`)
    }

    item.usages++

    if (item.consumption?.actions) {
      game.executeActions(item.consumption.actions, `items:ITEM-${item._id}-CONSUME`)
    }

    if (item.consumption && item.usages >= item.consumption.uses) {
      removeItemById(id, { notify: false })
    }

    game.statistics.record('consumedItems', id)
  }

  /**
   * Helper method to update an array of pending item change notifications
   */
  private updateItemChangeNotifications(
    notifications: ItemChange[],
    item: EditorItem,
    amount: number
  ) {
    const previous = notifications.find(not => not.id === item._id)

    if (previous) {
      previous.count += amount
    } else {
      notifications.push({
        id: item._id,
        name: item.name,
        count: amount
      })
    }
  }

  /**
   * Create item change notifications
   *
   * @param {Object[]}  notifications
   * @param {string}   notifications[].id - Item ID
   * @param {string}   notifications[].name - Item name
   * @param {number}   notifications[].count - Quantity
   */
  createItemChangeNotifications = (
    notifications: { id: string; name: string; count: number }[],
    notificationTime: number | undefined = undefined
  ) => {
    notifications.forEach(notification => {
      const prefix =
        notification.count > 0
          ? t('INVENTORY-GAINED-ITEM-NOTIFICATION')
          : t('INVENTORY-LOST-ITEM-NOTIFICATION')
      const absoluteCount = Math.abs(notification.count)
      const message =
        absoluteCount === 1
          ? `${prefix} "${notification.name}"`
          : `${prefix} ${absoluteCount}x "${notification.name}"`

      this.game.notifications.create(message, notificationTime)
    })
  }

  @action addItem(item: G['CharacterItem']) {
    this.addItems([item])
  }

  restoreItems(character: Character, savedItems: SaveDataItem[]) {
    const { game } = this

    const items = savedItems.reduce((items: CharacterItem[], storedItem: SaveDataItem) => {
      try {
        const defaultProps = game.getEntity('items', storedItem._id)

        const item = this.itemFactory({
          character,
          defaultProps,
          storedProps: storedItem
        })

        items.push(item)
      } catch (error) {
        logger.warn(`No item found with id ${storedItem._id}`)
        return items
      }

      return items
    }, [])

    if (items.length > 0) {
      this.addItems(items)
    }
  }

  @action addItems(items: G['CharacterItem'][]) {
    items.forEach(newItem => {
      const exists = this.items.some(existingItem => newItem.uuid === existingItem.uuid)

      if (exists) {
        throw new Error('Item UUID already exists in inventory.')
      }
    })

    this.items.push(...items)
  }

  @action removeItem(item: G['CharacterItem']) {
    const { items } = this
    const index = items.findIndex(i => i.uuid === item.uuid)

    if (item.equipped) {
      this.unEquipItem(item.uuid)
    }

    return items.splice(index, 1)[0]
  }

  @action removeAllItems({ notify = true, notificationTime = undefined }) {
    const { items } = this

    const notifications: ItemChange[] = []

    items.forEach(item => {
      this.removeItem(item)

      if (notify) {
        this.updateItemChangeNotifications(notifications, item, -1)
      }
    })

    this.createItemChangeNotifications(notifications, notificationTime)
  }

  /**
   * Remove item(s) by ID
   *
   * @param {string/array} ids - A single id or an array of ids
   * @param {object}  [options]
   * @param {boolean} [options.notify] - Whether or not to display a notification
   * @param {number}  [options.notificationTime] - Time in milliseconds to display the notification
   * @param {boolean} [options.equipAnother] - Whether or not to equip a replacement item if the
   *                                           item being removed is equipped and there are others
   *                                           of the same ID available.
   */
  @action removeItemById = (
    ids: string | string[],
    { notify = true, notificationTime = undefined, equipAnother = true } = {}
  ) => {
    if (typeof ids !== 'object') {
      ids = [ids]
    }

    const notifications: ItemChange[] = []

    ids.forEach(id => {
      const item = this.getInventoryItemById(id)
      const equipped = item?.equipped
      const equippedInSlotSetIndex = item?.equippedInSlotSetIndex

      if (item) {
        this.removeItem(item)

        if (notify) {
          this.updateItemChangeNotifications(notifications, item, -1)
        }
      }

      if (equipped && equipAnother) {
        const itemToEquip = this.getInventoryItemById(item._id)

        if (itemToEquip && typeof equippedInSlotSetIndex === 'number') {
          this.equipItem(itemToEquip.uuid, equippedInSlotSetIndex)
        }
      }
    })

    this.createItemChangeNotifications(notifications, notificationTime)
  }

  /**
   * Remove item(s) by UUID
   *
   * @param {string/array} uuids - A single uuid or an array of uuids
   * @param {object}  [options]
   * @param {boolean} [options.notify] - Whether or not to display a notification
   * @param {number}  [options.notificationTime] - Time in milliseconds to display the notification
   * @param {boolean} [options.equipAnother] - Whether or not to equip a replacement item if the
   *                                           item being removed is equipped and there are others
   *                                           of the same ID available.
   */
  @action removeItemByUuid = (
    uuids: TUuid | TUuid[],
    { notify = true, notificationTime = undefined, equipAnother = true } = {}
  ) => {
    if (typeof uuids !== 'object') {
      uuids = [uuids]
    }

    const notifications: ItemChange[] = []

    uuids.forEach(uuid => {
      const item = this.getInventoryItemByUuid(uuid)
      const equipped = item?.equipped
      const equippedInSlotSetIndex = item?.equippedInSlotSetIndex

      if (item) {
        this.removeItem(item)

        if (notify) {
          this.updateItemChangeNotifications(notifications, item, -1)
        }
      }

      if (equipped && equipAnother) {
        const itemToEquip = this.getInventoryItemById(item._id)

        if (itemToEquip && typeof equippedInSlotSetIndex === 'number') {
          this.equipItem(itemToEquip.uuid, equippedInSlotSetIndex)
        }
      }
    })

    this.createItemChangeNotifications(notifications, notificationTime)
  }

  /**
   * Mark item as seen
   */
  @action markItemAsSeen = (id: string) => {
    const items = this.items.filter(item => item._id === id)

    if (items && items.length > 0) {
      items.forEach(item => (item.hasSeen = true))

      const unseenItems = this.items.filter(item => !item.hasSeen)

      if (unseenItems.length === 0) {
        this.game.character.markNewItemNotificationAsSeen()
      }
    }
  }

  getInventoryItemByUuid = (uuid: TUuid) => {
    return this.items.find(item => item.uuid === uuid)
  }

  getInventoryItemById = (id: string) => {
    return Inventory.getItemById(id, this.items)
  }

  /**
   * Get currently equipped items given a list of slot names
   *
   * @param   {array} slotSet - An array of slot names
   * @return  {array} items - An array of items
   */
  getEquippedItems = (slotSet: Slot[] = []) => {
    return Object.entries(this.itemSlots).reduce((items: CharacterItem[], [slotName, itemUUID]) => {
      const item = itemUUID ? this.getInventoryItemByUuid(itemUUID) : null

      if (item && !items.includes(item) && slotSet.includes(slotName as Slot)) {
        items.push(item)
      }

      return items
    }, [])
  }

  /**
   * Checks and returns the current quantity of an item from inventory.
   *
   * @param {string} id - The ID of the item
   * @return {number} The quantity of the item
   */
  getItemQuantity = (id: string) => {
    return this.items.filter(item => item._id === id).length
  }

  getItemBySlotName = (slot: Slot) => {
    return this.items.find(item => item.uuid === this.itemSlots[slot])
  }

  /**
   * Pick up loot
   *
   * @param {object}  loot - Loot object generated by calculateLoot()
   * @param {number}  loot.gold
   * @param {array}   loot.items
   * @param {object}  [options]
   * @param {boolean} [options.equip] - Whether or not to equip the item
   * @param {boolean} [options.notify] - Whether or not to display a notification
   * @param {number}  [options.notificationTime] - Time in milliseconds to display the notification
   */
  @action pickUpLoot = (
    loot: { gold: number; items: { id: string; quantity: number }[] },
    { equip = false, notify = true, notificationTime = undefined } = {}
  ) => {
    // Convert the loot table to a single array of item ids (to be used for pickUpItem)
    const ids = loot.items.reduce((total: any[], item) => {
      const ids = Array(item.quantity || 1).fill(item.id)
      return (total = total.concat(ids))
    }, [])

    if (loot.gold) {
      this.game.character.changeGold(loot.gold, notify, notificationTime)
    }

    this.pickUpItem(ids, { notify, notificationTime, equip })
  }

  /**
   * Helper: Calculate loot
   *
   * Returns an object containing the gold and items that the loot
   * table consists of. Since loot is RNG, the result will most
   * likely differ every time this function is used.
   *
   * @param {string} id - The id of the loot table
   * @return {object}
   */
  calculateLoot = (id: string) => {
    const { getEntity } = this.game
    const lootTable = getEntity('lootTables', id)

    const items = lootTable.bundles.reduce((total: { id: string; quantity: number }[], bundle) => {
      const passes = this.game.passesConditions(bundle.conditions)

      if (passes) {
        const roll = Math.random()
        let probability = 0

        const [itemId, quantity] = bundle.items.reduce((total: [string?, number?], item) => {
          // Check if the roll is within the probability range of this item.
          if (probability + item.probability > roll && roll > probability) {
            const quantity = randomIntegerFromInterval(item.quantityRange[0], item.quantityRange[1])
            total.push(item.item, quantity)
          }

          // Add the item probability to set up the min-range for the next item
          probability += item.probability

          return total
        }, [])

        if (itemId && quantity) {
          total.push({
            id: itemId,
            quantity
          })
        }
      }

      return total
    }, [])

    const gold =
      lootTable.gold.length === 2
        ? randomIntegerFromInterval(lootTable.gold[0], lootTable.gold[1])
        : 0

    return {
      gold,
      items
    }
  }

  calculateLootFromMultiple = (ids: string[] = []) =>
    ids.reduce(
      (total: { gold: number; items: { id: string; quantity: number }[] }, id) => {
        const loot = this.calculateLoot(id)

        total.gold += loot.gold
        total.items = [...total.items, ...loot.items]

        return total
      },
      { gold: 0, items: [] }
    )

  /**
   * This method applies some business logic when selecting an item by id.
   *
   * i.e.: always selects the consumable with least uses.
   */
  static getItemById = <T extends EldrumTItem>(id: string, items: T[]): T | undefined => {
    const filteredItems = items.filter(item => item._id === id)

    if (!filteredItems.length) {
      return undefined
    }

    const isConsumable = filteredItems[0].consumption?.uses

    if (isConsumable) {
      return this.getConsumableWithLeastUses(filteredItems)
    } else {
      return filteredItems[0]
    }
  }

  static getConsumableWithLeastUses = <T extends EldrumTItem>(items: T[]): T =>
    items.reduce((resultItem, currentItem) =>
      (('usages' in resultItem && resultItem.usages) || 0) >
      (('usages' in currentItem && currentItem.usages) || 0)
        ? resultItem
        : currentItem
    )

  /**
   * Calculates armor
   */
  static armor(items: EldrumTItem[]) {
    return items
      .filter(item => item.armor)
      .reduce((total, item) => (item.armor ? total + item.armor : total), 0)
  }

  /**
   * Calculates encumbrance
   *
   * @param {array} items
   */
  static encumbranceFromItems(items: EldrumTItem[]) {
    return items.reduce((total, item) => {
      return item.encumbrance ? (total += item.encumbrance) : total
    }, 0)
  }

  static itemSlotNames = slots.reduce(
    (slotNames, slot) => {
      slotNames[slot] = slot.replace(/([A-Z])/g, ' $1').replace(/^./, function (str: string) {
        return str.toUpperCase()
      })

      return slotNames
    },
    {} as Record<Slot, string>
  )

  static getItemGroup = (item: EditorItem): (typeof Inventory.itemGroupNames)[number] => {
    if (item.type === 'weapon' || item.type === 'ammunition') {
      return 'weapon' as const
    } else if (item.type === 'armor' || item.type === 'shield') {
      return 'armor' as const
    } else {
      return item.type
    }
  }

  static itemGroupNames = [
    'weapon',
    'armor',
    'food',
    'medicine',
    'tool',
    'treasure',
    'scripture'
  ] as const

  static armorItemTypes = ['armor', 'shield']

  static weaponItemTypes = ['weapon', 'ammunition']

  /**
   * Item slot names (abbreviated)
   */
  static itemSlotNamesAbb = {
    head: 'He',
    body: 'B',
    hands: 'Ha',
    feet: 'F',
    accessory: 'A',
    mainHand: 'Mh',
    offHand: 'Oh'
  }

  static handSlots = [...handSlots]
}
