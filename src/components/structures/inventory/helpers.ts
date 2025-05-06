import type TItem from '../../../models/item/t-item'
import type { TGroupName } from './group'
import { Inventory as InventoryModel } from '../../../models/character/inventory'

const groupNames = InventoryModel.itemGroupNames

/**
 * Cluster
 *
 * Takes an array of item objects and returns a new array
 * where the items have been grouped together based on
 * item id. Adds _index value to preserve original index.
 * This is useful in order to be able to group identical items
 * no matter the quantity.
 *
 */
export const cluster = (items: TItem[]) => {
  const groupedItems: ClusteredItem[] = []

  items.forEach(item => {
    for (let index = 0; index < groupedItems.length; index++) {
      if (groupedItems[index]._id === item._id) {
        groupedItems[index].quantity++
        return
      }
    }

    const groupedItem = new ClusteredItem(
      item._id,
      item.name,
      InventoryModel.getItemGroup(item),
      'equipped' in item ? item.equipped : false,
      'hasSeen' in item ? item.hasSeen : undefined,
      1
    )

    groupedItems.push(groupedItem)
  })

  return groupedItems
}

export const getGroupNames = (items: ClusteredItem[], hideEmptyGroups?: boolean) => {
  if (hideEmptyGroups === true) {
    return items
      .reduce((names: TGroupName[], item) => {
        if (!names.includes(item.group)) {
          names.push(item.group)
        }

        return names
      }, [])
      .sort(function (a, b) {
        return groupNames.indexOf(a) - groupNames.indexOf(b)
      })
  } else {
    return groupNames.map(name => name)
  }
}

export class ClusteredItem {
  constructor(
    public _id: string,
    public name: string,
    public group: TGroupName,
    public equipped: boolean,
    public hasSeen: boolean | undefined,
    public quantity: number
  ) {}
}
