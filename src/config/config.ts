import type { PossiblyNullValues } from '../helpers/type-helpers'
import type { ProductType } from '../stores/purchase'
import { Platform } from 'react-native'

export type ProductSKUs = Record<ProductType, string | null>

export enum Environment {
  DEVELOPMENT = 'development',
  LOCAL = 'local',
  PRODUCTION = 'production'
}

interface IConfigParams {
  version: string
  environment: Environment
  paywallOptionId: string | null
  reviewAskOptionIds: string[]
  betaEndOptionId: string | null
  productSKUsAndroid?: PossiblyNullValues<ProductSKUs>
  productSKUsIOS?: PossiblyNullValues<ProductSKUs>
  startMenuTrackId: string | null
  startMenuBackgroundColor: string | null
  editor: {
    baseUrl?: string
  }
  sentry: {
    dsn: string | null
  }
  mixpanelToken?: string
  androidPackageName: string | null
  appStoreId: string | null
  maxPlaythroughs: number
  maxPlaythroughsPremium: number
  newsFeed: {
    url: string
  }
  oneSignalAppId: string | null
  supportedLocales: string[]
  localesServer: {
    baseUrl?: string
    projectSlug?: string
  }
  copyrightYear: string
  saveToEphemeralBeforeCombat?: boolean
}

export interface Config extends IConfigParams {}

export class Config {
  constructor(config: IConfigParams) {
    Object.assign(this, config)
  }

  get productSKUs() {
    return (
      Platform.select({
        android: {
          basic: this.productSKUsAndroid?.basic || null,
          premium: this.productSKUsAndroid?.premium || null,
          premiumUpgrade: this.productSKUsAndroid?.premiumUpgrade || null
        },
        ios: {
          basic: this.productSKUsIOS?.basic || null,
          premium: this.productSKUsIOS?.premium || null,
          premiumUpgrade: this.productSKUsIOS?.premiumUpgrade || null
        }
      }) || {
        basic: null,
        premium: null,
        premiumUpgrade: null
      }
    )
  }

  get allSkusExist() {
    return (
      typeof this.productSKUs === 'object' &&
      Object.values(this.productSKUs).every(val => typeof val === 'string')
    )
  }

  get enableContentInspector() {
    return this.environment !== Environment.PRODUCTION
  }

  saveToEphemeralBeforeCombat = false
}
