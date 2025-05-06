import { Mixpanel } from 'mixpanel-react-native'
import FirebaseAnalytics from '@react-native-firebase/analytics'

export enum GenericAnalyticsEvent {
  LINK_USED = 'usedLink',
  PURCHASED_PRODUCT = 'purchasedProduct'
}

type TEventValue = string | number | boolean | null | undefined | string[] | number[] | boolean[]
type TUserPropertyValue = string | boolean | number | undefined | null

class Analytics {
  enabled: boolean = false
  private mixpanel?: Mixpanel
  private readonly firebaseAnalytics = FirebaseAnalytics()

  setup = async ({ mixpanelToken }: { mixpanelToken: string }) => {
    const mixpanel = new Mixpanel(mixpanelToken, true)

    await mixpanel.init()

    if (__DEV__) {
      mixpanel.setLoggingEnabled(true)
    }

    this.mixpanel = mixpanel
  }

  /**
   * Event
   * @param name - Use the (Object) (Verb) format for event names. Like "Song Played" or "Page Viewed".
   */
  event = (name: string, extras: Record<string, TEventValue> = {}) => {
    const { mixpanel, firebaseAnalytics } = this

    if (mixpanel) {
      mixpanel.track(Analytics.toTitleCase(name), Analytics.transformObjectKeyCase('title', extras))
    }

    firebaseAnalytics.logEvent(
      Analytics.toSnakeCase(name),
      Analytics.transformObjectKeyCase('snake', extras)
    )
  }

  linkEvent = (url: string, context?: string, extras: Record<string, TEventValue> = {}) => {
    this.event(GenericAnalyticsEvent.LINK_USED, { url, context, ...extras })
  }

  purchaseEvent = (
    productId: string,
    price?: number,
    currency?: string,
    extras: Record<string, TEventValue> = {}
  ) => {
    this.event(GenericAnalyticsEvent.PURCHASED_PRODUCT, { price, currency, productId, ...extras })
  }

  screen = (name: string, extras: Record<string, TEventValue> = {}) => {
    const { mixpanel, firebaseAnalytics } = this

    if (mixpanel) {
      mixpanel.track(
        Analytics.toTitleCase(Analytics.screenViewEventName),
        Analytics.transformObjectKeyCase('title', { screenName: name, ...extras })
      )
    }

    firebaseAnalytics.logScreenView({ screen_name: name })
  }

  addUserProperty = (property: Record<string, TUserPropertyValue>, unique: boolean = false) => {
    const { mixpanel, firebaseAnalytics } = this

    if (mixpanel) {
      if (unique) {
        mixpanel.registerSuperPropertiesOnce(Analytics.transformObjectKeyCase('title', property))
      } else {
        mixpanel.registerSuperProperties(Analytics.transformObjectKeyCase('title', property))
      }
    }

    firebaseAnalytics.setUserProperties(
      Analytics.transformObjectKeyCase('snake', property, { transformForAnalytics: true })
    )
  }

  removeUserProperty = (propertyName: string) => {
    const { mixpanel, firebaseAnalytics } = this

    if (mixpanel) {
      mixpanel.unregisterSuperProperty(propertyName)
    }

    firebaseAnalytics.setUserProperties(
      Object.defineProperty({}, propertyName, {
        value: null
      })
    )
  }

  static transformObjectKeyCase = <Value>(
    type: 'snake' | 'title',
    obj: Record<string, Value>,
    options: { transformForAnalytics?: boolean } = {}
  ): Record<string, any> => {
    const transformedObject: Record<string, any> = {}
    const transformer = type === 'snake' ? Analytics.toSnakeCase : Analytics.toTitleCase

    for (const key in obj) {
      transformedObject[transformer(key)] = options.transformForAnalytics
        ? Analytics.typeCastForFirebase(obj[key])
        : obj[key]
    }

    return transformedObject
  }

  static screenViewEventName = 'screenView'

  static toSnakeCase = (string: string) => {
    return string
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('_')
  }

  static toTitleCase = (string: string) => {
    const result = string.replace(/([A-Z])/g, ' $1')

    return result.charAt(0).toUpperCase() + result.slice(1)
  }

  static typeCastForFirebase = (value: TUserPropertyValue): string | null => {
    if (value === undefined) {
      return null
    }

    if (typeof value === 'boolean') {
      return value ? 'true' : 'false'
    }

    if (typeof value === 'number') {
      return value.toString()
    }

    return value
  }
}

export const analytics = new Analytics()
