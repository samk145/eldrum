import React from 'react'
import { t } from '../../../i18n'
import { TouchableOpacity } from 'react-native'
import { Text } from '../../units'
import type { ClusteredItem } from './helpers'
import style from './list-item.style'

interface IItemProps {
  data: ClusteredItem
  selected: boolean
  onSelect: (item: ClusteredItem) => void
}

class ListItem extends React.Component<IItemProps> {
  shouldComponentUpdate(nextProps: Readonly<IItemProps>): boolean {
    if (this.props.selected !== nextProps.selected) {
      return true
    }

    if (this.props.data.quantity !== nextProps.data.quantity) {
      return true
    }

    if (this.props.data.equipped !== nextProps.data.equipped) {
      return true
    }

    if (this.props.data.hasSeen !== nextProps.data.hasSeen) {
      return true
    }

    return false
  }

  render() {
    const { data, selected, onSelect } = this.props
    const quantity = data.quantity > 1 ? ` (${data.quantity})` : null

    return (
      <TouchableOpacity
        touchSoundDisabled={true}
        style={style.wrapper}
        onPress={() => onSelect(data)}
      >
        <Text style={[style.text, selected ? style.textSelected : undefined]}>
          {data.name}
          {quantity}
        </Text>
        {data.equipped && (
          <Text style={style.equipped} accessibilityLabel={`(${t('INVENTORY-EQUIPPED-LABEL')})`}>
            {' '}
            •
          </Text>
        )}
        {data.hasSeen === false && (
          <Text style={style.new}>{t('INVENTORY-UNSEEN_ITEM-LABEL')}</Text>
        )}
      </TouchableOpacity>
    )
  }
}

export default ListItem
