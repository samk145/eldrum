import type { Database } from '../models/database'
import type ContentStore from './content'
import { action, observable } from 'mobx'
import { type Config } from '../config'
import Settings, {
  type SettingsProperties,
  DEFAULT_LOCALE
} from '../models/database/schemas/settings'
import Track from '../models/track'
import { i18n } from '../i18n'
import { logger } from '../helpers/logger'

type TBooleanSetting = keyof Omit<SettingsProperties, 'locale'>
type TStringSetting = keyof Pick<SettingsProperties, 'locale'>

export class SettingsStore {
  constructor(
    public contentStore: ContentStore,
    private readonly database: Database,
    public readonly config: Config
  ) {
    const { startMenuTrackId } = config
    const trackSource = startMenuTrackId
      ? contentStore.getMediaSource('audio', startMenuTrackId)
      : undefined

    if (trackSource && startMenuTrackId) {
      this.startTrack = new Track(trackSource, startMenuTrackId)
    }
  }

  startTrack: Track | null = null

  @observable values = {
    ...new Settings({
      user: 'main',
      isFirstAppLaunch: true,
      cinematicModeEnabled: false,
      seenCombatHintsFirstCombat: false,
      seenCombatHintsFirstCombatWithActions: false,
      soundEnabled: true,
      showSaveLimitWarning: true,
      locale: DEFAULT_LOCALE
    })
  }

  changeSetting(settingName: TBooleanSetting, newValue: boolean): Promise<void>
  changeSetting(settingName: TStringSetting, newValue: string): Promise<void>

  @action async changeSetting(settingName: keyof SettingsProperties, newValue: boolean | string) {
    try {
      if (!settingName) {
        throw new Error('You need to provide a setting name in order to change it.')
      }

      this.values[settingName] = newValue

      await this.storeSettings()
    } catch (error) {
      logger.error(error)
    }
  }

  restoreSettings = async () => {
    const settings = await this.database.collection<Settings>(Settings.schema.name)
    const storedCurrentUserSettings = settings.find(settings => settings.user === this.values.user)

    if (storedCurrentUserSettings) {
      this.values = storedCurrentUserSettings
    }

    if (this.values.locale !== DEFAULT_LOCALE) {
      i18n.changeLanguage(this.values.locale)
    }
  }

  storeSettings = async () => {
    await this.database.createOrUpdate<Settings>(Settings.schema.name, new Settings(this.values))
  }

  startMenuTrack = async () => {
    if (!this.startTrack || !this.values.soundEnabled) return

    try {
      await this.startTrack.play({
        loop: true,
        volume: 1
      })
    } catch (error) {
      logger.error(error)
    }
  }

  stopMenuTrack = async () => {
    if (!this.startTrack) return

    try {
      await this.startTrack.stop(500)
    } catch (error) {
      logger.error(error)
    }
  }

  changeLocale = async (localeCode: string) => {
    try {
      await this.changeSetting('locale', localeCode)
      i18n.changeLanguage(localeCode)
    } catch (error) {
      logger.error(error)
    }
  }
}

export default SettingsStore
