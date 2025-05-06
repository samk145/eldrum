import { Database } from '@actnone/eldrum-engine/models'
import { schemas } from '../../models/database/schemas'
import { realmMigrations as migrations } from './migrations'

export class DemoDatabase extends Database {}

export const database = new DemoDatabase(schemas, migrations)
