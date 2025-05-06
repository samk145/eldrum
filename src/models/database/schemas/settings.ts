import type { ObjectSchema } from 'realm'
import type { ISchemaClass, SchemaProperties } from '..'

export const DEFAULT_LOCALE = 'en'

export type SettingsProperties = Omit<
  Settings,
  'user' | 'schema' | 'schemaProperties' | 'parseJsonProperties'
>

interface Settings extends ISchemaClass {}

/* eslint-disable @typescript-eslint/no-extraneous-class */
class Settings {
  constructor({
    user = 'main',
    isFirstAppLaunch = true,
    cinematicModeEnabled = false,
    seenCombatHintsFirstCombat = false,
    seenCombatHintsFirstCombatWithActions = false,
    soundEnabled,
    showSaveLimitWarning,
    locale
  }: SettingsProperties & Pick<Settings, 'user'>) {
    this.user = user
    this.isFirstAppLaunch = isFirstAppLaunch
    this.cinematicModeEnabled = cinematicModeEnabled
    this.seenCombatHintsFirstCombat = seenCombatHintsFirstCombat
    this.seenCombatHintsFirstCombatWithActions = seenCombatHintsFirstCombatWithActions
    this.soundEnabled = typeof soundEnabled === 'boolean' ? soundEnabled : true
    this.showSaveLimitWarning =
      typeof showSaveLimitWarning === 'boolean' ? showSaveLimitWarning : true
    this.locale = locale || DEFAULT_LOCALE
  }

  static schemaProperties: SchemaProperties<Settings> = {
    user: 'string',
    isFirstAppLaunch: 'bool',
    cinematicModeEnabled: 'bool',
    seenCombatHintsFirstCombat: 'bool',
    seenCombatHintsFirstCombatWithActions: 'bool',
    soundEnabled: {
      type: 'bool',
      default: true,
      optional: false
    },
    showSaveLimitWarning: {
      type: 'bool',
      default: true,
      optional: false
    },
    locale: {
      type: 'string',
      default: DEFAULT_LOCALE,
      optional: false
    }
  }

  static schema: ObjectSchema = {
    name: 'Settings',
    primaryKey: 'user',
    properties: Settings.schemaProperties
  }

  user: string = 'main'
  isFirstAppLaunch: boolean
  cinematicModeEnabled: boolean
  seenCombatHintsFirstCombat: boolean
  seenCombatHintsFirstCombatWithActions: boolean
  soundEnabled: boolean
  showSaveLimitWarning: boolean
  locale: string
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default Settings
