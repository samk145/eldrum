import type { Stores } from '.'
import type { Database } from '../models/database'
import * as Font from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import * as RNFS from '@dr.pogodin/react-native-fs'
import { toByteArray } from 'base64-js'
import { zip } from 'react-native-zip-archive'
import { observable, reaction } from 'mobx'
import { analytics } from '../helpers/analytics'
import { t } from '../i18n'
import { logger } from '../helpers/logger'
import { NotificationsAnalyticsEvents } from './notifications'

if (!__DEV__) {
  SplashScreen.preventAutoHideAsync()
}

SplashScreen.setOptions({
  duration: 500,
  fade: true
})

const INIT_ERROR_EMAIL = 'hello@actnone.com'

export class SystemStore {
  constructor(
    private readonly stores: Stores,
    private readonly database: Database
  ) {
    this.init()
  }

  @observable fontsAreLoaded = false

  init = async () => {
    const { ui, purchase, content, saves, settings, review, achievements, notifications, play } =
      this.stores

    await this.loadFonts()

    try {
      await settings.restoreSettings()

      ui.setLoading(t('SYSTEM-STARTUP-LOADING-INITIALIZING'))
    } catch (error) {
      this.onInitError(error)
      return
    }

    try {
      if (settings.config.editor.baseUrl) {
        ui.setLoading(t('SYSTEM-STARTUP-LOADING-FETCHING_EDITOR_CONTENT'))
        await content.populateRemoteContent()
      }
    } catch (error) {
      logger.error(error)
    }

    try {
      if (settings.config.localesServer) {
        ui.setLoading(t('SYSTEM-STARTUP-LOADING-FETCHING_TRANSLATIONS'))
        await content.loadRemoteTranslations([settings.values.locale])
      }
    } catch (error) {
      logger.error(error)
    }

    try {
      if (settings.config.newsFeed.url) {
        ui.setLoading(t('SYSTEM-STARTUP-LOADING-FETCHING_NEWS_FEED'))
        await ui.getNews()
      }
    } catch (error) {
      logger.error(error)
    }

    ui.setLoading(t('SYSTEM-STARTUP-LOADING-ASSETS'))

    try {
      const loadImmediately = await notifications.init()
      await review.rehydrate()

      const isPristine = settings.values.isFirstAppLaunch
      const shouldRevokePurchases = await purchase.shouldRevokePurchases()

      if (!__DEV__ && (isPristine || shouldRevokePurchases)) {
        ui.setLoading(t('SYSTEM-STARTUP-LOADING-CHECKING_PURCHASES'))
        await purchase.restorePurchasesSilently()
      }

      if (!isPristine && !purchase.access) {
        ui.setLoading(t('SYSTEM-STARTUP-LOADING-SETTING_ACCESS'))
        await purchase.setAccessFromOrderHistory()
      }

      ui.setLoading(t('SYSTEM-STARTUP-LOADING-CHECKING_PERFORMANCE'))
      await ui.calculateDevicePerformanceClass()

      analytics.addUserProperty({
        devicePerformanceClass: ui.devicePerformanceClass
      })

      ui.setLoading(t('SYSTEM-STARTUP-LOADING-SAVE_DATA'))
      await saves.refreshSaves()

      ui.setLoading(t('SYSTEM-STARTUP-LOADING-ACHIEVEMENTS'))
      await achievements.init()

      ui.setLoading(t('SYSTEM-STARTUP-LOADING-INITIALIZING'))
      await settings.changeSetting('isFirstAppLaunch', false)

      if (loadImmediately) {
        ui.setLoading(t('SYSTEM-STARTUP-LOADING-CONTINUING'))
        play.loadFromLatestSave()
        analytics.event(NotificationsAnalyticsEvents.LOADED_FROM_NOTIFICATION)
      } else {
        ui.changeState('start')
      }
    } catch (error) {
      this.onInitError(error)
    }
  }

  loadFonts = async () => {
    const bodyExtension = 'otf'
    const bodyFolderName = 'ilisarniq'
    const bodyFontName = 'Ilisarniq'
    const bodyFontDemiName = 'Demi'
    const bodyFontLightName = 'Light'

    const displayExtension = 'otf'
    const displayFolderName = 'nocturne-serif'
    const displayFontName = 'NocturneSerif'

    await Font.loadAsync({
      'sans-serif-regular': require(
        `../assets/fonts/${bodyFolderName}/${bodyFontName}-Regular.${bodyExtension}`
      ),
      'sans-serif-regular-italic': require(
        `../assets/fonts/${bodyFolderName}/${bodyFontName}-Italic.${bodyExtension}`
      ),
      'sans-serif-bold': require(
        `../assets/fonts/${bodyFolderName}/${bodyFontName}-Bold.${bodyExtension}`
      ),
      'sans-serif-bold-italic': require(
        `../assets/fonts/${bodyFolderName}/${bodyFontName}-BoldItalic.${bodyExtension}`
      ),
      'sans-serif-light': require(
        `../assets/fonts/${bodyFolderName}/${bodyFontName}-${bodyFontLightName}.${bodyExtension}`
      ),
      'sans-serif-light-italic': require(
        `../assets/fonts/${bodyFolderName}/${bodyFontName}-${bodyFontLightName}Italic.${bodyExtension}`
      ),
      'sans-serif-demi': require(
        `../assets/fonts/${bodyFolderName}/${bodyFontName}-${bodyFontDemiName}.${bodyExtension}`
      ),
      'sans-serif-demi-italic': require(
        `../assets/fonts/${bodyFolderName}/${bodyFontName}-${bodyFontDemiName}Italic.${bodyExtension}`
      ),
      'serif-regular': require(
        `../assets/fonts/${displayFolderName}/${displayFontName}-Regular.${displayExtension}`
      )
    })

    this.fontsAreLoaded = true
  }

  private readonly onInitError = async (error: unknown) => {
    try {
      const databasePath = await this.database.getPath()
      const zipFileName = 'default.realm.zip'
      const zipPath = `${RNFS.DocumentDirectoryPath}/${zipFileName}`
      this.database.close()

      await zip([databasePath], zipPath)
      const databaseContent = await this.fileToUint8Array(zipPath)

      logger.sentry?.getCurrentScope().addAttachment({
        filename: zipFileName,
        data: databaseContent
      })

      logger.error(error)
      logger.sentry?.getCurrentScope().clearAttachments()

      await this.cleanUpFiles([zipPath])
    } catch (error) {
      logger.error(error)
    } finally {
      const { ui } = this.stores

      ui.alert(
        t('SYSTEM-STARTUP-ERROR-TITLE'),
        t('SYSTEM-STARTUP-ERROR-MESSAGE', { emailAddress: INIT_ERROR_EMAIL }),
        [{ text: t('SYSTEM-STARTUP-ERROR-BUTTON-LABEL') }]
      )

      ui.changeState('error')
    }
  }

  async fileToUint8Array(filePath: string) {
    const base64String = await RNFS.readFile(filePath, 'base64')
    return toByteArray(base64String)
  }

  cleanUpFiles = async (paths: string[]) => {
    for (const path of paths) {
      const fileExists = await RNFS.exists(path)

      if (fileExists) {
        await RNFS.unlink(path)
        logger.debug(`${path} deleted.`)
      }
    }
  }

  startReaction = reaction(
    () => this.stores.ui.state,
    state => {
      const { settings, play } = this.stores

      if (state === 'start' && settings.startTrack && !play.game && settings.values.soundEnabled) {
        settings.startMenuTrack()
      } else {
        settings.stopMenuTrack()
      }
    },
    { name: 'startReaction' }
  )
}

export default SystemStore
