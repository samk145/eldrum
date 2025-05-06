import type { TMigrations } from '@actnone/eldrum-engine/models'

export type TDocumentMigration<TOld = any, TNew = any> = (
  oldDocument: TOld,
  newDocument: TNew
) => TNew | undefined

export const realmMigrations: TMigrations = {}
