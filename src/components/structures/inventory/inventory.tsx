import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import { observer } from 'mobx-react'
import { isEqual } from 'lodash'

import type { Slot } from '../../../models/character/inventory'
import type TItem from '../../../models/item/t-item'
import type { TGroupName } from './group'
import type { TEquipChanges } from '../../../models/character/equip-change'

import { Inventory as InventoryModel } from '../../../models/character/inventory'
import { useGameStore } from '../../../contexts/stores'
import { type ClusteredItem, cluster, getGroupNames } from './helpers'
import List from './list'
import { SelectionWrapper } from './selection-wrapper'
import Groups, { getGroupItems } from './groups'
import * as styles from './inventory.style'

export type TSelectionButton = {
  action: () => void
  disabled?: boolean
  label: string
  accessibilityLabel?: string
}

export type TSelectionButtonProp<T extends TItem> =
  | TSelectionButton
  | ((item: T, slotSetValue?: number, whenEquipped?: TEquipChanges) => TSelectionButton | undefined)

export interface ISelectionProps<T extends TItem> {
  button?: TSelectionButtonProp<T>
  item?: T
  onSlotSetChange: (index: number) => void
  slotSetChangeDisabled?: boolean
  slotSetValue?: number
  lockToSlots?: Slot[]
}

export interface IInventoryProps<T extends TItem = TItem> {
  hideEmptyGroups?: boolean
  items: T[]
  onItemSelectionChange?: (item?: T, slotSetIndex?: number) => void
  selectedItemButton?: TSelectionButtonProp<T>
  showOnlyForSlots?: Slot[]
  selection: (selectionProps: ISelectionProps<T>) => React.ReactNode
}

interface IInventoryState<T extends TItem> {
  selectedGroup: TGroupName
  selectedItem: T | undefined
  selectedItemSlotSetIndex: number | undefined
}

/**
 * The inventory component is used for displaying the player's inventory, the inventory
 * when buying and selling items to a merchant
 *
 * @param items - A list of items to be displayed in the inventory.
 * @param hideEmptyGroups - Wether or not to hide empty groups from bottom bar.
 * @param onItemSelectionChange
 * @param selectedItemButton - Adds an actionable button to the selected item, such as "eat", "sell", "equip" etc.
 * @param showOnlyForSlots - If provided, Inventory will show only items that can be equipped in those slots
 * @component
 */
export const Inventory = observer(function Inventory<T extends TItem = TItem>({
  hideEmptyGroups,
  items,
  onItemSelectionChange,
  selectedItemButton,
  showOnlyForSlots,
  selection
}: IInventoryProps<T>) {
  const game = useGameStore()
  const itemEquippedInSlot = game?.character.inventory.equippedItemsBySlot.find(equipment =>
    showOnlyForSlots?.includes(equipment.slot)
  )?.item
  const clusteredItems = cluster(items)
  const currentGroupNames = getGroupNames(clusteredItems, hideEmptyGroups)
  const [state, setState] = useState<IInventoryState<T>>({
    selectedGroup: itemEquippedInSlot
      ? InventoryModel.getItemGroup(itemEquippedInSlot)
      : currentGroupNames[0],
    selectedItem: itemEquippedInSlot || undefined,
    selectedItemSlotSetIndex: undefined
  })
  const handleGroupSelection = (name: TGroupName) => {
    setState({
      selectedGroup: name,
      selectedItem: undefined,
      selectedItemSlotSetIndex: undefined
    })

    if (onItemSelectionChange) {
      onItemSelectionChange()
    }
  }

  const selectItem = (itemId: string) => {
    const item = InventoryModel.getItemById(itemId, items)
    const newSlotSetIndex = getItemSlotSetIndex(item)

    setState({
      ...state,
      selectedItem: item,
      selectedItemSlotSetIndex: newSlotSetIndex
    })

    if (onItemSelectionChange) {
      onItemSelectionChange(item, newSlotSetIndex)
    }
  }

  const getItemSlotSetIndex = (item: TItem | undefined) => {
    if (!item?.slotSets) {
      return undefined
    }

    const itemEquipped = game.character.inventory.equippedItems.find(
      equippedItem => equippedItem.uuid === item?.uuid
    )
    const equippedInSlotSet = itemEquipped?.equippedInSlotSet

    return equippedInSlotSet
      ? item.slotSets.findIndex(slotSet => isEqual(slotSet, equippedInSlotSet))
      : Math.max(
          item.slotSets.findIndex(slotSet =>
            slotSet.some(slotName => showOnlyForSlots?.includes(slotName))
          ),
          0
        )
  }

  const handleItemSelection = (clusteredItem: ClusteredItem) => {
    selectItem(clusteredItem._id)
  }

  const handleSlotSetChange = (index: number) => {
    setState({ ...state, selectedItemSlotSetIndex: index })

    if (onItemSelectionChange) {
      onItemSelectionChange(state.selectedItem, index)
    }
  }

  useEffect(() => {
    const selectedItems = items.filter(
      item => state.selectedItem && item._id === state.selectedItem._id
    )

    if (!selectedItems.length) {
      setState({ ...state, selectedItem: undefined })
    } else {
      selectItem(selectedItems[0]._id)
    }
  }, [items.length])

  const itemsToShow = getGroupItems(clusteredItems, state.selectedGroup)
  const defaultSlotSetIndex =
    state.selectedItem?.slotSets &&
    'equippedInSlotSetIndex' in state.selectedItem &&
    state.selectedItem.equippedInSlotSetIndex !== null
      ? state.selectedItem.equippedInSlotSetIndex
      : 0

  return (
    <View style={styles.inventory.wrapper}>
      <SelectionWrapper>
        {selection({
          button: selectedItemButton,
          item: state.selectedItem,
          lockToSlots: showOnlyForSlots,
          onSlotSetChange: handleSlotSetChange,
          slotSetValue: state.selectedItemSlotSetIndex ?? defaultSlotSetIndex
        })}
      </SelectionWrapper>
      <View style={styles.inventory.bottomWrapper}>
        <List
          key={state.selectedGroup}
          data={itemsToShow}
          currentItemId={state.selectedItem ? state.selectedItem._id : undefined}
          onSelectItem={handleItemSelection}
        />
        <Groups
          items={clusteredItems}
          onSelect={handleGroupSelection}
          hideEmptyGroups={hideEmptyGroups}
          selectedGroup={state.selectedGroup}
          includedGroups={currentGroupNames}
        />
      </View>
    </View>
  )
})
