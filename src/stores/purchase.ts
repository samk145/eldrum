import type { Stores } from './'
import type { Database } from '../models/database'
import { observable, action, computed } from 'mobx'
import { t } from '../i18n'
import NetInfo from '@react-native-community/netinfo'
import {
  setup,
  finishTransaction,
  flushFailedPurchasesCachedAsPendingAndroid,
  getAvailablePurchases,
  getProducts,
  initConnection,
  type Product,
  type Purchase,
  type PurchaseError,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase
} from 'react-native-iap'
import { type EmitterSubscription, Platform } from 'react-native'
import Order, { type ParsedOrder } from '../models/database/schemas/order'
import { delay } from '../helpers/misc'
import { analytics } from '../helpers/analytics'
import { logger } from '../helpers/logger'

const CONTACT_EMAIL = 'hello@actnone.com'

export enum PurchaseAnalyticsEvents {
  PURCHASED_PRODUCT = 'Purchased Product',
  RESTORED_PURCHASES = 'Restored Purchases'
}

const productTypes = ['basic', 'premium', 'premiumUpgrade'] as const
export type ProductType = (typeof productTypes)[number]
type ProductAccessType = Exclude<ProductType, 'premiumUpgrade'>

export enum AccessType {
  demo,
  basic,
  premium
}

type AdditionalProductData = {
  perks: string[]
  productType: ProductType
}

export type EnrichedProduct = Product & Partial<AdditionalProductData>

const warningTypes = {
  E_USER_CANCELLED: 'E_USER_CANCELLED'
}

type TWarningTypes = keyof typeof warningTypes

const errorTypes = {
  E_IAP_NOT_AVAILABLE: 'E_IAP_NOT_AVAILABLE',
  E_UNKNOWN: 'E_UNKNOWN',
  E_USER_ERROR: 'E_USER_ERROR',
  E_ITEM_UNAVAILABLE: 'E_ITEM_UNAVAILABLE',
  E_REMOTE_ERROR: 'E_REMOTE_ERROR',
  E_NETWORK_ERROR: 'E_NETWORK_ERROR',
  E_SERVICE_ERROR: 'E_SERVICE_ERROR',
  E_RECEIPT_FAILED: 'E_RECEIPT_FAILED',
  E_RECEIPT_FINISHED_FAILED: 'E_RECEIPT_FINISHED_FAILED',
  E_NOT_PREPARED: 'E_NOT_PREPARED',
  E_NOT_ENDED: 'E_NOT_ENDED',
  E_ALREADY_OWNED: 'E_ALREADY_OWNED',
  E_DEVELOPER_ERROR: 'E_DEVELOPER_ERROR',
  E_BILLING_RESPONSE_JSON_PARSE_ERROR: 'E_BILLING_RESPONSE_JSON_PARSE_ERROR',
  E_DEFERRED_PAYMENT: 'E_DEFERRED_PAYMENT'
}

type TErrorTypes = keyof typeof errorTypes

export type ProductsObject = Record<ProductType, EnrichedProduct>

export class PurchaseStore {
  constructor(
    private readonly stores: Pick<Stores, 'ui' | 'settings'>,
    private readonly database: Database
  ) {
    if (!stores.settings.config.productSKUs.basic) {
      this.access = AccessType.premium
      this.trackEntitlement()
    }
  }

  purchaseUpdateSubscription: EmitterSubscription | null = null
  purchaseErrorSubscription: EmitterSubscription | null = null

  @observable awaitingResponse = false
  @observable products: EnrichedProduct[] = []
  @observable ownedProducts: (ProductType | null)[] = []
  @observable access = AccessType.demo

  get isConfigured() {
    const { config } = this.stores.settings

    return config.allSkusExist
  }

  @computed get maxPlaythroughs() {
    const { config } = this.stores.settings

    return this.access === AccessType.premium
      ? config.maxPlaythroughsPremium
      : config.maxPlaythroughs
  }

  @computed get premiumValue(): string {
    const { basic, premiumUpgrade } = this.productsObject
    const originalValue =
      basic && premiumUpgrade && (Number(basic.price) + Number(premiumUpgrade.price)).toFixed(2)

    return originalValue ? `${originalValue}` : ''
  }

  @computed get productsObject() {
    const { config } = this.stores.settings
    const result: Partial<ProductsObject> = {}

    this.products.forEach(product => {
      const { basic, premium, premiumUpgrade } = config.productSKUs

      switch (product.productId) {
        case basic: {
          result.basic = product
          break
        }
        case premiumUpgrade: {
          result.premiumUpgrade = product
          break
        }
        case premium: {
          result.premium = product
          break
        }
        default: {
          break
        }
      }
    })

    return result
  }

  @action openStore = async () => {
    this.awaitingResponse = true

    try {
      const netState = await NetInfo.fetch()

      if (!netState.isConnected) return

      setup({ storekitMode: 'STOREKIT1_MODE' })
      await initConnection()

      if (Platform.OS === 'android') {
        await flushFailedPurchasesCachedAsPendingAndroid()
      }

      await this.populateProducts()
      this.initiatePurchaseHandlers()
    } catch (error) {
      logger.error(error)
    } finally {
      this.awaitingResponse = false
    }
  }

  closeStore = () => {
    this.removePurchaseHandlers()
  }

  initiatePurchaseHandlers = () => {
    this.removePurchaseHandlers()

    this.purchaseUpdateSubscription = purchaseUpdatedListener(this.purchaseUpdateHandler)
    this.purchaseErrorSubscription = purchaseErrorListener(this.purchaseErrorHandler)
  }

  removePurchaseHandlers = () => {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove()
      this.purchaseUpdateSubscription = null
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove()
      this.purchaseErrorSubscription = null
    }
  }

  initiatePurchase = async (sku: string, options?: { fake: boolean }) => {
    this.awaitingResponse = true

    if (options?.fake) {
      await delay(2000)
      this.access = this.getAccessFromProductId(sku)
      this.ownedProducts.push(this.getProductType(sku))
      this.awaitingResponse = false
      return
    }

    if (!sku) {
      throw new Error(`No SKU supplied. Aborting purchase.`)
    }
    try {
      const netState = await NetInfo.fetch()

      if (!netState.isConnected) {
        return this.stores.ui.alert(
          t('PURCHASE-CONNECTION_FAILURE-TITLE'),
          t('PURCHASE-CONNECTION_FAILURE-MESSAGE')
        )
      }

      // Attempt to re-fetch products if there aren't any. This was
      // added because iOS sometimes returned "invalid" sku error.
      // By doing this, we'll at least make sure that paywall has
      // a fresh product setup in case requestPurchase fails..
      if (!this.products.length) {
        await this.populateProducts()
      }

      const params = Platform.select({
        ios: {
          sku,
          andDangerouslyFinishTransactionAutomaticallyIOS: false
        },
        android: {
          skus: [sku]
        }
      })

      if (params) {
        await requestPurchase(params)
      }
    } catch (error) {
      logger.error(error)
    } finally {
      this.awaitingResponse = false
    }
  }

  purchaseUpdateHandler = async (purchase: Purchase) => {
    try {
      if (purchase.transactionReceipt) {
        await this.saveOrderInLocalStorage(new Order(purchase))
        await this.setAccessFromOrderHistory()
        await finishTransaction({ purchase, isConsumable: false })
        analytics.event(PurchaseAnalyticsEvents.PURCHASED_PRODUCT, {
          productSku: purchase.productId
        })
      }
    } catch (error) {
      logger.error(error)
    } finally {
      this.awaitingResponse = false
    }
  }

  purchaseErrorHandler = (error: PurchaseError) => {
    const { alert } = this.stores.ui

    if (error.code && !warningTypes[error.code as TWarningTypes]) {
      const message =
        errorTypes[error.code as TErrorTypes] && error.message
          ? error.message
          : t('PURCHASE-UNKNOWN_FAILURE-MESSAGE')

      alert(t('PURCHASE-UNKNOWN_FAILURE-TITLE'), message)
      logger.error(error)
    }

    this.awaitingResponse = false
  }

  deletePurchases = async () => {
    try {
      await this.database.deleteAll(Order.schema.name)
      this.access = AccessType.demo
    } catch (error) {
      logger.error(error)
    }
  }

  restorePurchases = async () => {
    const netState = await NetInfo.fetch()

    if (!netState.isConnected) {
      throw new Error(t('PURCHASE-CONNECTION_FAILURE-MESSAGE'))
    }

    await initConnection()

    const transactions = await getAvailablePurchases()

    await this.removeOrdersFromLocalStorage()

    for (let i = 0; i < transactions.length; i++) {
      await this.saveOrderInLocalStorage(new Order(transactions[i]))
    }

    await this.setAccessFromOrderHistory()
  }

  restorePurchasesWithMessage = async (successMessage = true) => {
    const { alert } = this.stores.ui

    try {
      this.awaitingResponse = true
      await this.restorePurchases()

      if (!this.access) {
        alert(
          t('PURCHASE-RESTORE-FAILURE-TITLE'),
          t('PURCHASE-RESTORE-FAILURE-MESSAGE', { emailAddress: CONTACT_EMAIL })
        )
      } else if (this.access && successMessage) {
        alert(t('PURCHASE-RESTORE-SUCCESS-TITLE'), t('PURCHASE-RESTORE-SUCCESS-MESSAGE'))
        analytics.event(PurchaseAnalyticsEvents.RESTORED_PURCHASES)
      }
    } catch (error) {
      alert(t('PURCHASE-RESTORE-FAILURE-TITLE'), t('PURCHASE-UNKNOWN_FAILURE-MESSAGE'))
      logger.error(error)
    } finally {
      this.awaitingResponse = false
    }
  }

  restorePurchasesSilently = async () => {
    try {
      await this.restorePurchases()
    } catch (error) {
      logger.error(error)
    }
  }

  get storeName() {
    switch (Platform.OS) {
      case 'android':
        return 'Google Play'
      case 'ios':
        return 'App Store'
    }
  }

  shouldRevokePurchases = async () => {
    const netState = await NetInfo.fetch()

    if (!netState.isConnected) {
      return false
    }

    return Platform.OS === 'android' && this.isConfigured && Math.random() < 0.25
  }

  @action populateProducts = async () => {
    const { config } = this.stores.settings

    if (!config.allSkusExist) {
      const missingSkus = Object.entries(config.productSKUs)
        .filter(([_, value]) => !value)
        .map(([key]) => key)
      const message = missingSkus.join(', ')
      throw new Error(`One or more SKUs are missing. Please check the following: ${message}.`)
    }

    const skus = Object.values(config.productSKUs).filter(sku => sku !== null)
    const products = await getProducts({ skus })
    const enrichedProducts = this.enrichProducts(products)

    this.products = enrichedProducts || []
  }

  getProductType = (productId: string): ProductType | null => {
    const { config } = this.stores.settings

    switch (productId) {
      case config.productSKUs.basic: {
        return 'basic'
      }
      case config.productSKUs.premium: {
        return 'premium'
      }
      case config.productSKUs.premiumUpgrade: {
        return 'premiumUpgrade'
      }
      default:
        return null
    }
  }

  enrichProducts = (products: Product[]): EnrichedProduct[] =>
    products.map(product => {
      const productType = this.getProductType(product.productId)

      if (!productType) {
        return product
      }

      return this.enrichProduct(product, productType)
    })

  enrichProduct = (product: Product, productType: ProductType): EnrichedProduct => {
    const { config } = this.stores.settings
    const normalizedAccessType = productType === 'premiumUpgrade' ? 'premium' : productType
    const perks = PurchaseStore.getProductPerks(
      normalizedAccessType,
      config.maxPlaythroughs,
      config.maxPlaythroughsPremium
    )

    return { ...product, productType, perks }
  }

  static getProductPerks = (
    type: ProductAccessType,
    maxPlaythroughs: number,
    maxPlaythroughsPremium: number
  ): string[] => {
    switch (type) {
      case 'basic':
        return [
          t('PURCHASE-IAP_PERKS-ACCESS_FULL_GAME-TITLE'),
          t('PURCHASE-IAP_PERKS-INCREASED_PLAYTHROUGHS-TITLE', { number: maxPlaythroughs })
        ]
      case 'premium':
        return [
          t('PURCHASE-IAP_PERKS-ACCESS_FULL_GAME-TITLE'),
          t('PURCHASE-IAP_PERKS-INCREASED_PLAYTHROUGHS-TITLE', { number: maxPlaythroughsPremium }),
          t('PURCHASE-IAP_PERKS-BRANCHING-TITLE')
        ]
      default:
        return []
    }
  }

  getAccessTypeFromOrder = (order: ParsedOrder) => {
    const { productId } = order.transaction

    return this.getAccessFromProductId(productId as string)
  }

  getAccessFromProductId = (productId: string) => {
    const { productSKUs } = this.stores.settings.config

    switch (productId) {
      case productSKUs.basic: {
        return AccessType.basic
      }
      case productSKUs.premium:
      case productSKUs.premiumUpgrade: {
        return AccessType.premium
      }
      default: {
        return AccessType.demo
      }
    }
  }

  @action setAccessFromOrderHistory = async () => {
    const orders = await this.database.collection<Order>(Order.schema.name)
    let maximumAccess = AccessType.demo

    orders.forEach(order => {
      const orderAccessType = this.getAccessTypeFromOrder(order)

      if (orderAccessType > maximumAccess) {
        maximumAccess = orderAccessType
      }
    })

    this.access = maximumAccess
    this.ownedProducts = orders.map(order =>
      this.getProductType(order.transaction.productId as string)
    )
    this.trackEntitlement()
  }

  saveOrderInLocalStorage = async (order: Order) => {
    await this.database.createOrUpdate<Order>(Order.schema.name, order)
  }

  removeOrdersFromLocalStorage = async () => {
    await this.database.deleteAll(Order.schema.name)
  }

  private readonly trackEntitlement = () =>
    analytics.addUserProperty({ entitlement: AccessType[this.access] })
}

export default PurchaseStore
