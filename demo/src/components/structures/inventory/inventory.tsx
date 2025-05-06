import type { TDemoItem } from '~demo/models/item'
import React from 'react'
import { Inventory, type IInventoryProps } from '@actnone/eldrum-engine/components'
import Selection from './selection'

interface IDemoInventoryProps extends Omit<IInventoryProps<TDemoItem>, 'selection'> {}

export const DemoInventory = (props: IDemoInventoryProps) => {
  return (
    <Inventory
      {...props}
      selection={props => {
        return <Selection {...props} />
      }}
    />
  )
}
