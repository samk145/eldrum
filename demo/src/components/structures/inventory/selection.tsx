import type { ISelectionProps } from '@actnone/eldrum-engine/components'
import type { TDemoItem } from '~demo/models/item'

import { observer } from 'mobx-react'
import React from 'react'
import { View } from 'react-native'
import { useGameStore } from '@actnone/eldrum-engine/contexts'
import { Button } from '@actnone/eldrum-engine/components'
import style from './selection.style'
import { CharacterItem } from '@actnone/eldrum-engine/models'
import Headline from './headline'
import ItemStats from './item-stats'
import SlotsButton from './slots-button'

const COLUMN_WIDTH = '47.5%'

const Selection: React.FC<ISelectionProps<TDemoItem>> = ({
  button,
  item,
  onSlotSetChange,
  slotSetValue = 0,
  lockToSlots
}) => {
  const { character } = useGameStore()

  if (!item) {
    return <View style={style.wrapper}></View>
  }

  const selectedSlotSet = item.slotSets?.[slotSetValue]
  const isEquippedInCurrentSlot =
    item instanceof CharacterItem && slotSetValue === item.equippedInSlotSetIndex
  const equipChanges =
    selectedSlotSet &&
    (() => {
      if (item instanceof CharacterItem) {
        return item.slotSets && !isEquippedInCurrentSlot
          ? character.equipEffect(item, selectedSlotSet)
          : undefined
      }

      return item.slotSets && character.equipEffect(item, selectedSlotSet)
    })()

  const itemButton =
    button && typeof button === 'function' ? button(item, slotSetValue, equipChanges) : button

  return (
    <View style={style.wrapper}>
      <Headline name={item.name} description={item.description} />

      {(item.slotSets || item.consumption) && (
        <View style={style.statsWrapper}>
          <ItemStats item={item} equipChanges={equipChanges} />
        </View>
      )}

      <View style={style.buttonRow}>
        <View style={{ width: COLUMN_WIDTH }}>
          {item.slotSets && (
            <SlotsButton
              onChange={onSlotSetChange}
              value={slotSetValue}
              slotSets={item.slotSets}
              disabled={lockToSlots?.length === 1}
            />
          )}
        </View>
        <View style={{ width: COLUMN_WIDTH }}>
          {button && itemButton && (
            <Button
              size="small"
              disabled={!!itemButton.disabled}
              label={itemButton.label}
              accessibilityLabel={itemButton.accessibilityLabel}
              onPress={itemButton.action}
            />
          )}
        </View>
      </View>
    </View>
  )
}

export default observer(Selection)
