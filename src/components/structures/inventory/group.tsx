import type { Inventory } from '../../../models/character/inventory'
import type { ClusteredItem } from './helpers'

import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import { camelCaseToConstCase } from '../../../helpers/misc'
import { Text, Icon } from '../../units'
import style, { groupIconSize } from './group.style'

export type TGroupName = (typeof Inventory.itemGroupNames)[number]

interface IGroupProps {
  name: TGroupName
  items: ClusteredItem[]
  isSelected: boolean
  onSelect: (name: TGroupName) => void
}

const Group: React.FC<IGroupProps> = ({ name, items, isSelected, onSelect }) => {
  const { t } = useTranslation()
  const newItemsCount = items.filter(item => item.hasSeen === false).length

  return (
    <TouchableOpacity
      accessibilityState={{ expanded: isSelected }}
      accessibilityLabel={
        newItemsCount
          ? `${t(`INVENTORY-ITEM-TYPE-${camelCaseToConstCase(name)}`)} (${items.length}), ${newItemsCount} ${t('INVENTORY-UNSEEN_ITEM-LABEL')}.`
          : `${t(`INVENTORY-ITEM-TYPE-${camelCaseToConstCase(name)}`)} (${items.length})`
      }
      touchSoundDisabled={true}
      style={style.wrapper}
      key={name}
      onPress={isSelected ? undefined : () => onSelect(name)}
    >
      <Icon
        style={[style.icon, isSelected && style.activeIcon]}
        name={name}
        height={groupIconSize}
        width={groupIconSize}
        fill="#FFFFFF"
      />

      {items.length > 0 && (
        <View style={style.count}>
          <Text style={style.countText}>{items.length}</Text>
          {newItemsCount > 0 && <Text style={style.countNewDot}>•</Text>}
        </View>
      )}
    </TouchableOpacity>
  )
}

export default Group
