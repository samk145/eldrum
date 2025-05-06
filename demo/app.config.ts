import type { ExpoConfig } from '@expo/config'
import path from 'path'
import dotenv from 'dotenv'
import z from 'zod'
import { name, version } from './package.json'

const EXPO_ACCOUNT_OWNER = 'actnone' // expo account owner

const GetColorPerEnv = (env: string) => {
  if (env === 'production') return '#0077BD'
  if (env === 'development') return '#0077BD'
  if (env === 'local') return '#24792E'
}

const appEnvs = ['local', 'development', 'production'] as const

type TAppEnv = (typeof appEnvs)[number]

const APP_ENV: TAppEnv = (process.env.APP_ENV as TAppEnv) || 'local'
const envName = `.env.${APP_ENV}`
const envPath = path.resolve(__dirname, envName)
const mainEnvPath = path.resolve(__dirname, '.env')

dotenv.config({ path: mainEnvPath })

dotenv.config({
  path: envPath,
  override: true
})

const client = z.object({
  APP_ENV: z.enum(appEnvs),
  APP_NAME: z.string(),
  VERSION: z.string(),
  EDITOR_BASE_URL: z.string(),
  PAYWALL_OPTION_ID: z.string(),
  SENTRY_DSN: z.string(),
  PRODUCT_BASIC_SKU_ANDROID: z.string(),
  PRODUCT_BASIC_SKU_IOS: z.string(),
  PRODUCT_PREMIUM_SKU_ANDROID: z.string(),
  PRODUCT_PREMIUM_SKU_IOS: z.string(),
  PRODUCT_PREMIUM_UPGRADE_SKU_ANDROID: z.string(),
  PRODUCT_PREMIUM_UPGRADE_SKU_IOS: z.string(),
  ANDROID_PACKAGE_NAME: z.string(),
  IOS_BUNDLE_ID: z.string(),
  APP_STORE_ID: z.string(),
  START_MENU_TRACK_ID: z.string(),
  SPLASH_BACKGROUND_COLOR: z.string(),
  MAX_PLAYTHROUGHS: z.string(),
  MAX_PLAYTHROUGHS_PREMIUM: z.string(),
  BETA_END_OPTION_ID: z.string(),
  NEWS_FEED_URL: z.string(),
  REVIEW_ASK_OPTION_IDS: z.string(),
  MIXPANEL_TOKEN: z.string(),
  LOADER_RIBBON_COLOR: z.string(),
  LOADER_DAGGER_COLOR: z.string(),
  ONESIGNAL_APP_ID: z.string(),
  SUPPORTED_LOCALES: z.string(),
  LOCALES_SERVER_BASE_URL: z.optional(z.string()),
  LOCALES_SERVER_PROJECT_SLUG: z.optional(z.string()),
  COPYRIGHT_YEAR: z.string(),
  GAME_SAVE_BEFORE_COMBAT_ENABLED: z.string()
})

const buildTime = z.object({
  APPLE_DEVELOPER_TEAM_ID: z.string(),
  EXPO_ACCOUNT_OWNER: z.string(),
  EAS_PROJECT_ID: z.string(),
  SENTRY_ORG: z.string(),
  SENTRY_PROJECT: z.string(),
  SENTRY_AUTH_TOKEN: z.optional(z.string())
})

/**
 * @type {Record<keyof z.infer<typeof client> , string | undefined>}
 */
const _clientEnv = {
  APP_ENV,
  APP_NAME: process.env.APP_NAME,
  VERSION: version,
  EDITOR_BASE_URL: process.env.EDITOR_BASE_URL,
  PAYWALL_OPTION_ID: process.env.PAYWALL_OPTION_ID,
  SENTRY_DSN: process.env.SENTRY_DSN,
  PRODUCT_BASIC_SKU_ANDROID: process.env.PRODUCT_BASIC_SKU_ANDROID,
  PRODUCT_BASIC_SKU_IOS: process.env.PRODUCT_BASIC_SKU_IOS,
  PRODUCT_PREMIUM_SKU_ANDROID: process.env.PRODUCT_PREMIUM_SKU_ANDROID,
  PRODUCT_PREMIUM_SKU_IOS: process.env.PRODUCT_PREMIUM_SKU_IOS,
  PRODUCT_PREMIUM_UPGRADE_SKU_ANDROID: process.env.PRODUCT_PREMIUM_UPGRADE_SKU_ANDROID,
  PRODUCT_PREMIUM_UPGRADE_SKU_IOS: process.env.PRODUCT_PREMIUM_UPGRADE_SKU_IOS,
  ANDROID_PACKAGE_NAME: process.env.ANDROID_PACKAGE_NAME,
  IOS_BUNDLE_ID: process.env.IOS_BUNDLE_ID,
  APP_STORE_ID: process.env.APP_STORE_ID,
  START_MENU_TRACK_ID: process.env.START_MENU_TRACK_ID,
  SPLASH_BACKGROUND_COLOR: process.env.SPLASH_BACKGROUND_COLOR,
  MAX_PLAYTHROUGHS: process.env.MAX_PLAYTHROUGHS,
  MAX_PLAYTHROUGHS_PREMIUM: process.env.MAX_PLAYTHROUGHS_PREMIUM,
  BETA_END_OPTION_ID: process.env.BETA_END_OPTION_ID,
  NEWS_FEED_URL: process.env.NEWS_FEED_URL,
  REVIEW_ASK_OPTION_IDS: process.env.REVIEW_ASK_OPTION_IDS,
  MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN,
  LOADER_RIBBON_COLOR: process.env.LOADER_RIBBON_COLOR,
  LOADER_DAGGER_COLOR: process.env.LOADER_DAGGER_COLOR,
  ONESIGNAL_APP_ID: process.env.ONESIGNAL_APP_ID,
  SUPPORTED_LOCALES: process.env.SUPPORTED_LOCALES,
  LOCALES_SERVER_BASE_URL: process.env.LOCALES_SERVER_BASE_URL,
  LOCALES_SERVER_PROJECT_SLUG: process.env.LOCALES_SERVER_PROJECT_SLUG,
  COPYRIGHT_YEAR: process.env.COPYRIGHT_YEAR,
  GAME_SAVE_BEFORE_COMBAT_ENABLED: process.env.GAME_SAVE_BEFORE_COMBAT_ENABLED
}

const _buildTimeEnv = {
  APPLE_DEVELOPER_TEAM_ID: process.env.APPLE_DEVELOPER_TEAM_ID,
  EXPO_ACCOUNT_OWNER,
  EAS_PROJECT_ID: process.env.EAS_PROJECT_ID,
  SENTRY_ORG: process.env.SENTRY_ORG,
  SENTRY_PROJECT: process.env.SENTRY_PROJECT,
  SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN
}

const _env = {
  ..._clientEnv,
  ..._buildTimeEnv
}

const merged = buildTime.merge(client)
const parsed = merged.safeParse(_env)

if (!parsed.success) {
  console.error(
    '❌ Invalid environment variables:',
    parsed.error.flatten().fieldErrors,

    `\n❌ Missing variables in ${envName} file, Make sure all required variables are defined in the ${envName} file.`,
    `\n💡 Tip: If you recently updated the ${envName} file and the error still persists, try restarting the server with the -cc flag to clear the cache.`
  )
  throw new Error('Invalid environment variables, Check terminal for more details ')
}

const Env = parsed.data
const ClientEnv = client.parse(_clientEnv)

const config: ExpoConfig = {
  newArchEnabled: false,
  name: Env.APP_NAME,
  description: `${Env.APP_NAME} Mobile App`,
  owner: Env.EXPO_ACCOUNT_OWNER,
  slug: name,
  version: Env.VERSION.toString(),
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  icon: './assets/icon.png',
  updates: {
    enabled: false,
    checkAutomatically: 'NEVER'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: Env.IOS_BUNDLE_ID,
    requireFullScreen: true,
    config: {
      usesNonExemptEncryption: false
    },
    infoPlist: {
      LSApplicationQueriesSchemes: ['itms-apps'], // Required for react-native-rate-app
      NSLocationWhenInUseUsageDescription:
        'Your location can be used to send location-based ina-app messages.',
      LSMinimumSystemVersion: '12.0.0'
    },
    googleServicesFile: `./assets/firebase/${Env.APP_ENV}/GoogleService-Info.plist`
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png'
    },
    package: Env.ANDROID_PACKAGE_NAME,
    blockedPermissions: [
      'android.permission.RECORD_AUDIO',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE'
    ],
    googleServicesFile: `./assets/firebase/${Env.APP_ENV}/google-services.json`
  },
  plugins: [
    'expo-asset',
    'expo-font',
    [
      'expo-splash-screen',
      {
        backgroundColor: Env.SPLASH_BACKGROUND_COLOR,
        image: './assets/splash-icon.png',
        imageWidth: 150
      }
    ],
    'react-native-iap',
    name === 'demo' ? '../app.plugin.js' : '@actnone/eldrum-engine',
    [
      'expo-build-properties',
      {
        android: {
          extraMavenRepos: ['../../node_modules/@notifee/react-native/android/libs']
        },
        ios: {
          useFrameworks: 'static',
          ccacheEnabled: true,
          deploymentTarget: '15.5.0'
        }
      }
    ],
    [
      'app-icon-badge',
      {
        enabled: Env.APP_ENV !== 'production',
        badges: [
          {
            text: Env.APP_ENV.length > 5 ? Env.APP_ENV.substring(0, 3).toUpperCase() : Env.APP_ENV,
            type: 'banner',
            color: 'white',
            background: GetColorPerEnv(Env.APP_ENV)
          },
          {
            text: Env.VERSION.toString(),
            type: 'ribbon',
            color: 'white',
            background: GetColorPerEnv(Env.APP_ENV)
          }
        ]
      }
    ],
    '@react-native-firebase/app',
    [
      'onesignal-expo-plugin',
      {
        mode: Env.APP_ENV === 'local' ? 'development' : 'production',
        smallIcons: ['./assets/ic_stat_onesignal_default.png'],
        largeIcons: ['./assets/ic_onesignal_large_icon_default.png'],
        devTeam: Env.APPLE_DEVELOPER_TEAM_ID
      }
    ],
    [
      'expo-dev-launcher',
      {
        launchMode: 'most-recent'
      }
    ]
  ],
  extra: {
    ...ClientEnv,
    eas: {
      projectId: Env.EAS_PROJECT_ID
    }
  }
}

if (Env.SENTRY_AUTH_TOKEN && Env.SENTRY_ORG && Env.SENTRY_PROJECT) {
  if (!config.plugins) {
    config.plugins = []
  }

  config.plugins.push([
    '@sentry/react-native/expo',
    {
      organization: Env.SENTRY_ORG,
      project: Env.SENTRY_PROJECT,
      authToken: Env.SENTRY_AUTH_TOKEN
    }
  ])
}

export default config
