import type { AppStateStatus } from 'react-native'
import type { EditorNotification } from '@actnone/eldrum-editor/dist/types'
import type { Config } from '../config'
import type { Stores } from '.'

import { AppState } from 'react-native'
import { t } from '../i18n'
import notifee, { AuthorizationStatus, TriggerType, AndroidVisibility } from '@notifee/react-native'
import { OneSignal } from 'react-native-onesignal'
import { analytics } from '../helpers/analytics'
import { logger } from '../helpers/logger'
import { getNotificationTimestamp } from '../helpers/misc'

export enum NotificationsAnalyticsEvents {
  LOADED_FROM_NOTIFICATION = 'Loaded from Notification'
}

export class NotificationsStore {
  constructor(
    private readonly stores: Pick<Stores, 'content' | 'play'>,
    private readonly config: Config
  ) {
    AppState.addEventListener('change', this.handleApplicationStateChange)
  }

  notificationIds: string[] = []

  init = async () => {
    const { config } = this
    const initialNotification = await notifee.getInitialNotification()

    this.clearNotifications()
    const permission = await notifee.requestPermission()

    await notifee.createChannel({
      id: NotificationsStore.channelId,
      name: NotificationsStore.channelName
    })

    const permissionStatus = (() => {
      switch (permission.authorizationStatus) {
        case AuthorizationStatus.AUTHORIZED:
          return 'Authorized'
        case AuthorizationStatus.DENIED:
          return 'Denied'
        case AuthorizationStatus.NOT_DETERMINED:
          return 'Not Determined'
        case AuthorizationStatus.PROVISIONAL:
          return 'Provisional'
        default:
          return 'Unknown'
      }
    })()

    analytics.addUserProperty({ pushNotificationStatus: permissionStatus })

    if (config.oneSignalAppId) {
      OneSignal.initialize(config.oneSignalAppId)
      // No need to check permission through OneSignal SDK, as it's handled by Notifee
    }

    return !!initialNotification
  }

  handleApplicationStateChange = (nextAppState: AppStateStatus) => {
    try {
      switch (nextAppState) {
        case 'background':
          this.createNotifications()
          break
        default:
          this.clearNotifications()
      }
    } catch (error) {
      logger.error(error)
    }
  }

  createNotifications = async () => {
    const { play } = this.stores
    const { notifications } = this.stores.content.data.settings

    if (!play.game || !notifications) {
      return
    }

    let timestamp = Date.now()

    for (let i = 0; i < notifications.length; i++) {
      const notification = notifications[i]

      if (play.game.passesConditions(notification.conditions)) {
        if (!this.notificationIds.includes(notification._id)) {
          // Increase the timestamp for each notification to spread them out
          timestamp = NotificationsStore.getNotificationTimestamp(timestamp)
          await this.createNotification(notification, timestamp)
        }
      }
    }
  }

  createNotification = async (notification: EditorNotification, timestamp: number) => {
    await notifee.createTriggerNotification(
      {
        title:
          typeof notification.title === 'string'
            ? t(`PUSH_NOTIFICATION-${notification._id}-TITLE`, { ns: 'push-notifications' })
            : undefined,
        body: t(`PUSH_NOTIFICATION-${notification._id}-BODY`, { ns: 'push-notifications' }),
        android: {
          channelId: NotificationsStore.channelId,
          visibility: AndroidVisibility.PUBLIC,
          smallIcon: NotificationsStore.androidIconSmall,
          color: NotificationsStore.androidIconSmallColor,
          pressAction: {
            id: NotificationsStore.androidPressActionId
          }
        }
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp
      }
    )

    this.notificationIds.push(notification._id)
  }

  clearNotifications = () => {
    this.notificationIds = []
    notifee.cancelAllNotifications()
  }

  restore = async () => {}

  store = async () => {}

  static channelId = 'reminders'
  static channelName = 'Reminders'
  static androidIconSmall = 'ic_notification_small'
  static androidIconSmallColor = '#000000'
  static androidPressActionId = 'default'
  static getNotificationTimestamp = getNotificationTimestamp
}

export default NotificationsStore
