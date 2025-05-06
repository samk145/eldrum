import React from 'react'
import Constants from 'expo-constants'
import * as Sentry from '@sentry/react-native'
import { useTranslation } from 'react-i18next'
import { version } from '../package.json'
import { DemoStores } from '~demo/stores'
import { logger, analytics } from '@actnone/eldrum-engine/helpers'
import { AppWrapper, Navigation, QuestLog } from '@actnone/eldrum-engine/components'
import { Config, Environment } from '@actnone/eldrum-engine/config'
import { logoLarge, logoSmall } from '~demo/assets/graphics/logo'
import Combat from '~demo/components/partials/combat/combat'
import { Buy, Sell, CharacterInventory, CharacterScreen } from '~demo/components/structures'

const APP_NAME = 'Eldrum: Demo'
const backgroundImage = require('./assets/graphics/start.jpg')
const env = Constants.expoConfig?.extra ?? {}

const config = new Config({
  version,
  environment: env.APP_ENV,
  paywallOptionId: env.PAYWALL_OPTION_ID || null,
  reviewAskOptionIds: env.REVIEW_ASK_OPTION_IDS ? env.REVIEW_ASK_OPTION_IDS.split(',') : [],
  betaEndOptionId: env.BETA_END_OPTION_ID || null,
  productSKUsAndroid: {
    basic: env.PRODUCT_BASIC_SKU_ANDROID,
    premium: env.PRODUCT_PREMIUM_SKU_ANDROID,
    premiumUpgrade: env.PRODUCT_PREMIUM_UPGRADE_SKU_ANDROID
  },
  productSKUsIOS: {
    basic: env.PRODUCT_BASIC_SKU_IOS,
    premium: env.PRODUCT_PREMIUM_SKU_IOS,
    premiumUpgrade: env.PRODUCT_PREMIUM_UPGRADE_SKU_IOS
  },
  startMenuTrackId: env.START_MENU_TRACK_ID || null,
  startMenuBackgroundColor: env.SPLASH_BACKGROUND_COLOR || null,
  editor: {
    baseUrl: env.EDITOR_BASE_URL
  },
  sentry: {
    dsn: env.SENTRY_DSN || null
  },
  mixpanelToken: env.MIXPANEL_TOKEN,
  androidPackageName: env.ANDROID_PACKAGE_NAME || null,
  appStoreId: env.APP_STORE_ID || null,
  maxPlaythroughs: Number(env.MAX_PLAYTHROUGHS) || 3,
  maxPlaythroughsPremium: Number(env.MAX_PLAYTHROUGHS_PREMIUM) || 10,
  newsFeed: {
    url: env.NEWS_FEED_URL
  },
  oneSignalAppId: env.ONESIGNAL_APP_ID || null,
  supportedLocales: env.SUPPORTED_LOCALES ? env.SUPPORTED_LOCALES.split(',') : [],
  localesServer: {
    baseUrl: env.LOCALES_SERVER_BASE_URL,
    projectSlug: env.LOCALES_SERVER_PROJECT_SLUG
  },
  copyrightYear: env.COPYRIGHT_YEAR,
  saveToEphemeralBeforeCombat: Boolean(env.GAME_SAVE_BEFORE_COMBAT_ENABLED)
})

if (config.sentry.dsn) {
  logger.setup({
    dsn: config.sentry.dsn,
    environment: config.environment,
    traceSampleRate: config.environment === Environment.PRODUCTION ? 0.1 : 1
  })
}

if (config.mixpanelToken) {
  const startAnalytics = async (token: string) => {
    try {
      await analytics.setup({ mixpanelToken: token })
    } catch (error: any) {
      logger.error(error)
    }
  }

  startAnalytics(config.mixpanelToken)
}

const stores = new DemoStores(config)

function App() {
  const { t } = useTranslation()

  return (
    <AppWrapper stores={stores}>
      <Navigation
        startProps={{
          backgroundImage,
          logo: {
            accessibilityLabel: APP_NAME,
            large: { xml: logoLarge, originalDimensions: { width: 978, height: 756 } },
            small: { xml: logoSmall, originalDimensions: { width: 978, height: 253 } }
          }
        }}
        inGameProps={{
          combat: <Combat />,
          bottomBarProps: {
            onClose: game => {
              game.puppeteer.modal === 'bargain' && game.bargain?.endBargain()
            },
            cardIndex: game => {
              return game.puppeteer.modal === 'bargain' ? 0 : undefined
            },
            cards: game => {
              const defaultCards = [
                {
                  label: t('TABS-CHARACTER-LABEL'),
                  notification: () => game.character.unspentStatPoints > 0,
                  render: <CharacterScreen />
                },
                {
                  label: t('TABS-INVENTORY-LABEL'),
                  notification: () => game.character.displayItemNotification,
                  onOpen: game.character.markNewItemNotificationAsSeen,
                  render: <CharacterInventory />
                },
                {
                  label: t('TABS-QUESTS-LABEL'),
                  notification: () => game.questLog.displayNotification,
                  onOpen: game.questLog.hideNotification,
                  render: <QuestLog />
                }
              ]

              const bargainCards = [
                {
                  label: t('BARGAIN-TABS-BUY-LABEL'),
                  render: <Buy />
                },
                {
                  label: t('BARGAIN-TABS-SELL-LABEL'),
                  render: <Sell />
                }
              ]

              return game.puppeteer.modal === 'bargain' ? bargainCards : defaultCards
            }
          }
        }}
      />
    </AppWrapper>
  )
}

export default Sentry.wrap(App)
