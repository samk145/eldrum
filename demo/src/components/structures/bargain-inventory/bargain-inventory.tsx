import type { TDemoItem } from '~demo/models/item'
import React from 'react'
import { observer } from 'mobx-react'
import { useTranslation } from 'react-i18next'
import { type TSelectionButtonProp } from '@actnone/eldrum-engine/components'
import { DemoInventory } from '../inventory/inventory'
import { useDemoGameStore } from '~demo/hooks'

const UNSELLABLE_ITEM_TIER = '5'

const generateAccessibilityLabel = (
  prefix: string,
  price: number,
  currentGold: number,
  currencyName: string
) => {
  return `${prefix} for ${price} ${currencyName} (current ${currencyName}: ${currentGold})`
}

export const Sell = observer(() => {
  const { t } = useTranslation()
  const game = useDemoGameStore()
  const { bargain, character } = game

  if (!bargain) {
    throw new Error('Attempting to render Bargain Inventory without bargain model')
  }

  const action: TSelectionButtonProp<TDemoItem> = item => {
    const disabled = item.tier === UNSELLABLE_ITEM_TIER
    const price = bargain.calculateSellValue(item) || 0
    const label = `${t('BARGAIN-SELL-LABEL-PREFIX')} • ${price} ${t('BARGAIN-CURRENCY-NAME')}`
    const accessibilityLabel = generateAccessibilityLabel(
      t('BARGAIN-SELL-LABEL-PREFIX'),
      price,
      character.gold,
      t('BARGAIN-CURRENCY-NAME')
    )

    return {
      accessibilityLabel: disabled ? t('BARGAIN-SELL-DISABLED-TIER-LABEL') : accessibilityLabel,
      label: disabled ? t('BARGAIN-SELL-DISABLED-TIER-LABEL') : label,
      action: () => bargain.sellItem(item),
      disabled
    }
  }

  return <DemoInventory items={character.inventory.items} selectedItemButton={action} />
})

export const Buy = observer(() => {
  const { t } = useTranslation()
  const game = useDemoGameStore()
  const { bargain, character } = game

  if (!bargain) {
    throw new Error('Attempting to render Bargain Inventory without bargain model')
  }

  const action: TSelectionButtonProp<TDemoItem> = item => {
    const price = bargain.calculateBuyPrice(item)
    const label = `${t('BARGAIN-BUY-LABEL-PREFIX')} • ${price} ${t('BARGAIN-CURRENCY-NAME')}`
    const accessibilityLabel = generateAccessibilityLabel(
      t('BARGAIN-BUY-LABEL-PREFIX'),
      price,
      character.gold,
      t('BARGAIN-CURRENCY-NAME')
    )

    return {
      accessibilityLabel,
      label,
      action: () => bargain.buyItem(item),
      disabled: bargain.calculateBuyPrice(item) > character.gold
    }
  }

  return (
    <DemoInventory items={bargain.inventory} selectedItemButton={action} hideEmptyGroups={true} />
  )
})
