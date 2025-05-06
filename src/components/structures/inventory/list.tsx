import type { ClusteredItem } from './helpers'

import React from 'react'
import { View, ScrollView } from 'react-native'
import { t } from '../../../i18n'
import { Text, AccessibilityFocus } from '../../units'
import ListItem from './list-item'
import style from './list.style'

interface IListProps {
  data: ClusteredItem[]
  currentItemId?: string
  onSelectItem: (item: ClusteredItem) => void
}

class List extends React.PureComponent<IListProps> {
  render() {
    const { data, currentItemId, onSelectItem } = this.props

    const items = data.map((item, index) => (
      <AccessibilityFocus
        key={`${item._id}-${index}`}
        id={`ItemList-${index}`}
        focusOnMount
        focusOnUpdate={false}
        delay={50}
        shouldFocus={index === 0}
      >
        <ListItem data={item} selected={currentItemId === item._id} onSelect={onSelectItem} />
      </AccessibilityFocus>
    ))

    return (
      <ScrollView style={style.wrapper}>
        {items.length ? (
          <View style={{ paddingBottom: 30 }}>{items}</View>
        ) : (
          <AccessibilityFocus id="ItemListFirstItem" focusOnMount shouldFocus style={style.item}>
            <Text style={style.empty}>{t('INVENTORY-LIST-EMPTY-MESSAGE')}</Text>
          </AccessibilityFocus>
        )}
      </ScrollView>
    )
  }
}

export default List
