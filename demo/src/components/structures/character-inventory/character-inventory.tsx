import type { TDemoItem } from '~demo/models/item'
import React from 'react'
import { observer } from 'mobx-react'
import { useTranslation } from 'react-i18next'
import { useDemoGameStore } from '~demo/hooks'
import { type TSelectionButtonProp } from '@actnone/eldrum-engine/components'
import { DemoInventory } from '../inventory/inventory'

export const CharacterInventory = observer(() => {
  const { character, openReader } = useDemoGameStore()
  const { inventory } = character
  const { t } = useTranslation()

  const action: TSelectionButtonProp<TDemoItem> = (item, slotSetIndex, whenEquipped) => {
    const { inventory } = character

    if ('equippable' in item && item.equippable) {
      const isEquippedInCurrentSlotSet = !!(
        item.equippedInSlotSetIndex !== undefined && item.equippedInSlotSetIndex === slotSetIndex
      )

      return {
        label: isEquippedInCurrentSlotSet
          ? t('INVENTORY-UN_EQUIP-ACTION')
          : t('INVENTORY-EQUIP-ACTION'),
        disabled: whenEquipped ? !whenEquipped.canEquip : false,
        action: isEquippedInCurrentSlotSet
          ? () => inventory.unEquipItem(item.uuid)
          : () => inventory.equipItem(item.uuid, slotSetIndex)
      }
    }

    if (item.type === 'scripture') {
      return {
        label: t('INVENTORY-ITEM-USE-BUTTON-SCRIPTURE-LABEL'),
        action: () => item.scripture && openReader(item.scripture)
      }
    }

    if (item.type === 'food') {
      return {
        label: t('INVENTORY-ITEM-USE-BUTTON-FOOD-LABEL'),
        action: () => inventory.consumeItem(item._id)
      }
    }

    if (item.type === 'medicine') {
      return {
        label: t('INVENTORY-ITEM-USE-BUTTON-MEDICINE-LABEL'),
        action: () => inventory.consumeItem(item._id)
      }
    }
  }

  const onItemSelectionChange = (item?: TDemoItem) => {
    if (item) {
      inventory.markItemAsSeen(item._id)
    }
  }

  return (
    <DemoInventory
      hideEmptyGroups={false}
      items={inventory.items}
      onItemSelectionChange={onItemSelectionChange}
      selectedItemButton={action}
    />
  )
})
