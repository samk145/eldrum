import type { ISchemaClass, SchemaProperties } from '..'
import type { ObjectSchema } from 'realm'
import { uuid } from '../../../helpers/misc'

export function parseOrder(order: Order): ParsedOrder {
  return {
    ...order,
    transaction: JSON.parse(order.transaction)
  }
}

export type ParsedOrder = Omit<Order, 'transaction'> & {
  transaction: any
}

interface Order extends ISchemaClass {}

/* eslint-disable @typescript-eslint/no-extraneous-class */
class Order {
  constructor(transaction: any) {
    this._id = transaction.transactionId || uuid()
    this.transaction = JSON.stringify(transaction)
  }

  static schemaProperties: SchemaProperties<Order> = {
    _id: 'string',
    transaction: 'string'
  }

  static schema: ObjectSchema = {
    name: 'Order',
    primaryKey: '_id',
    properties: Order.schemaProperties
  }

  _id: string
  transaction: string
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default Order
