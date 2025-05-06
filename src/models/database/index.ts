import type Save from './schemas/save'
import { type ParsedOrder } from './schemas/order'
import type Order from './schemas/order'
import { parseOrder } from './schemas/order'
import type Achievements from './schemas/achievements'
import type Review from './schemas/review'
import type Settings from './schemas/settings'
import { logger } from '../../helpers/logger'
import Realm, { UpdateMode, type ObjectSchema, type PropertySchema } from 'realm'

export * from './schemas'

type PropertyType =
  | string
  | 'bool'
  | 'int'
  | 'float'
  | 'double'
  | 'decimal128'
  | 'objectId'
  | 'string'
  | 'data'
  | 'date'
  | 'list'
  | 'linkingObjects'

export type SchemaProperties<T> = Record<
  keyof Omit<T, 'schema' | 'schemaProperties' | 'parseJsonProperties'>,
  PropertyType | PropertySchema
>

export interface ISchemaClass {
  schema: ObjectSchema
  schemaProperties: SchemaProperties<ISchemaClass>
}

type CollectionReturnType<C> = C extends Achievements
  ? Achievements
  : C extends Save
    ? Save
    : C extends Order
      ? ParsedOrder
      : C extends Settings
        ? Settings
        : C extends Review
          ? Review
          : never

export type TMigration = (oldRealm: Realm, newRealm: Realm) => void
export type TMigrations = Record<number, TMigration | undefined>

export interface IDatabaseGeneric {
  Order: Order
}

// This class has no getDocument method because using
// 'objectForPrimaryKey' caused some problems while testing the write operations
// Related to: https://github.com/realm/realm-java/issues/6288
// Where 'objectForPrimaryKey()' would be the equivalent of 'findFirstAsync()' in java
export class Database<G extends IDatabaseGeneric = IDatabaseGeneric> {
  constructor(
    private readonly schemas: ISchemaClass['schema'][],
    private readonly migrations: TMigrations
  ) {}

  private instance: Realm | null = null

  async getInstance(): Promise<Realm> {
    this.instance = await Realm.open({
      schema: this.schemas,
      schemaVersion: Object.keys(this.migrations).length,
      onMigration: (oldRealm, newRealm) => {
        logger.debug(
          `RealmDB: Migrating from schema ${oldRealm.schemaVersion} to ${newRealm.schemaVersion}`
        )

        Object.entries(this.migrations).forEach(([key, migration]) => {
          const keyAsNumber = parseInt(key)

          if (oldRealm.schemaVersion < keyAsNumber) {
            migration?.(oldRealm, newRealm)
            logger.debug(`RealmDB: Completed migration to version ${keyAsNumber}`)
          }
        })

        logger.debug('RealmDB: Migration complete!')
      }
    })

    if (!this.instance) {
      throw new Error("Couldn't get a valid instance of Realm.")
    }

    return this.instance
  }

  async document<T extends ISchemaClass, K extends keyof T>(
    collectionName: T['schema']['name'],
    primaryKey: T[K]
  ): Promise<CollectionReturnType<T>> {
    const db = this.instance || (await this.getInstance())
    const document = db.objectForPrimaryKey<T>(collectionName, primaryKey)?.toJSON()

    if (collectionName === 'Order') {
      return parseOrder(document as unknown as G['Order']) as CollectionReturnType<T>
    }

    return document as unknown as CollectionReturnType<T>
  }

  async collection<T extends ISchemaClass>(
    collectionName: T['schema']['name']
  ): Promise<CollectionReturnType<T>[]> {
    const db = this.instance || (await this.getInstance())
    const rawCollection = db.objects<T>(collectionName).toJSON()
    const parsedCollection = rawCollection.map(item => {
      if (collectionName === 'Order') {
        return parseOrder(item as unknown as G['Order'])
      }
      return item
    })

    return parsedCollection as CollectionReturnType<T>[]
  }

  async createOrUpdate<T extends ISchemaClass>(
    collectionName: T['schema']['name'],
    properties: Partial<T>
  ): Promise<CollectionReturnType<T>> {
    const db = this.instance || (await this.getInstance())
    const newDocument = db.write<T>(() => {
      return db.create<T>(collectionName, properties, UpdateMode.All).toJSON() as T
    })

    if (collectionName === 'Order') {
      return parseOrder(newDocument as unknown as G['Order']) as CollectionReturnType<T>
    }

    return newDocument as unknown as CollectionReturnType<T>
  }

  async delete<T extends ISchemaClass>(
    collectionName: T['schema']['name'],
    id: T[keyof T]
  ): Promise<void> {
    const db = this.instance || (await this.getInstance())
    const itemToDelete = db.objectForPrimaryKey<T>(collectionName, id)
    db.write(() => {
      db.delete(itemToDelete)
    })
  }

  async deleteMany<T extends ISchemaClass>(
    collectionName: T['schema']['name'],
    path: string,
    values: (string | undefined)[] | []
  ): Promise<CollectionReturnType<T>[]> {
    const db = this.instance || (await this.getInstance())
    const itemsToDelete = db.objects(collectionName).filtered(path, ...values)
    db.write(() => {
      db.delete(itemsToDelete)
    })

    return await this.collection(collectionName)
  }

  async deleteAll(collectionName: string) {
    const db = this.instance || (await this.getInstance())

    db.write(() => {
      db.delete(db.objects(collectionName))
    })
  }

  getPath = async () => {
    const db = this.instance || (await this.getInstance())

    return db.path
  }

  close = async () => {
    const db = this.instance || (await this.getInstance())
    db.close()
  }
}
