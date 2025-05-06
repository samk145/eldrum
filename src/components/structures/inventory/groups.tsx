import React from 'react'
import _ from 'lodash'
import { View } from 'react-native'
import type { ClusteredItem } from './helpers'
import type { TGroupName } from './group'
import Group from './group'
import style from './groups.style'

/**
 * Get Group items
 *
 * Clusters and groups items based on supplied group name.
 *
 */
const getGroupItems = (items: ClusteredItem[], groupName: string) => {
  const groupItems = items.filter(item => item.group === groupName)

  return _.orderBy(groupItems, ['name'])
}

interface IGroupsProps {
  items: ClusteredItem[]
  hideEmptyGroups?: boolean
  selectedGroup: TGroupName
  onSelect: (name: TGroupName) => void
  includedGroups: TGroupName[]
}

const Groups: React.FC<IGroupsProps> = ({
  items,
  onSelect,
  hideEmptyGroups,
  selectedGroup,
  includedGroups
}) => {
  const groups = includedGroups.map(name => (
    <Group
      key={name}
      name={name}
      items={getGroupItems(items, name)}
      onSelect={onSelect}
      isSelected={selectedGroup === name}
    />
  ))

  return (
    <View style={[style.wrapper, hideEmptyGroups === true && style.wrapperWithHidden]}>
      {groups}
    </View>
  )
}

export { getGroupItems }
export default Groups
