import type { TDemoItem } from '~demo/models/item'
import type { TItem, Slot } from '@actnone/eldrum-engine/models'

import React from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { action } from 'mobx'
import { useDemoGameStore } from '~demo/hooks'
import { useDimensions } from '@actnone/eldrum-engine/hooks'
import { type TSelectionButtonProp } from '@actnone/eldrum-engine/components'
import { DemoInventory } from '../inventory/inventory'
import { CardModal } from '@actnone/eldrum-engine/components'
import { variables } from '@actnone/eldrum-engine/styles'

const getItemsForSlot = (items: TDemoItem[], slots: Slot[]) => {
  return items.filter(item => {
    if (item.slotSets) {
      for (let i = 0; i < item.slotSets.length; i++) {
        const slotSet = item.slotSets[i]
        if (slotSet.some(slotName => slots?.includes(slotName))) {
          return true
        }
      }
    }
    return false
  })
}

type IGearSwapperProps = {
  visible: boolean
  slots: Slot[]
  onChangeWrapper: (change: () => void, actionType: 'equip' | 'unequip') => void
  close: () => void
}

export const GearSwapper: React.FC<IGearSwapperProps> = ({
  visible,
  slots,
  close,
  onChangeWrapper
}) => {
  const game = useDemoGameStore()
  const { t } = useTranslation()
  const { inventory } = game.character
  const { insets, maxHeight } = useDimensions()
  const items = getItemsForSlot(inventory.items, slots)
  const itemButton: TSelectionButtonProp<TDemoItem> = (item, slotSetIndex, whenEquipped) => {
    const isEquippedInCurrentSlotSet = !!(
      'equippedInSlotSetIndex' in item &&
      item.equippedInSlotSetIndex !== undefined &&
      item.equippedInSlotSetIndex === slotSetIndex
    )

    return {
      label: isEquippedInCurrentSlotSet
        ? t('INVENTORY-UN_EQUIP-ACTION')
        : t('INVENTORY-EQUIP-ACTION'),
      disabled: whenEquipped ? !whenEquipped.canEquip : false,
      action: isEquippedInCurrentSlotSet
        ? () => onChangeWrapper(() => inventory.unEquipItem(item.uuid), 'unequip')
        : () => onChangeWrapper(() => inventory.equipItem(item.uuid, slotSetIndex), 'equip')
    }
  }

  const handleSelection = action((item?: TItem) => {
    if (item) {
      inventory.markItemAsSeen(item._id)
    }
  })

  return (
    <CardModal visible={visible} onHandleDragSuccess={close} useOverlay onOverlayPress={close}>
      <View
        style={{
          flex: 1,
          paddingBottom: insets.bottom + variables.distance / 3,
          height: Math.min(maxHeight - variables.distance * 7, 900)
        }}
      >
        <DemoInventory
          items={items}
          onItemSelectionChange={handleSelection}
          selectedItemButton={itemButton}
          showOnlyForSlots={slots}
          hideEmptyGroups
        />
      </View>
    </CardModal>
  )
}
