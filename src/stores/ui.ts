import type SettingsStore from './settings'

import { observable, action, computed } from 'mobx'
import { t } from '../i18n'
import {
  AccessibilityInfo,
  Alert,
  AppState,
  findNodeHandle,
  NativeEventEmitter,
  NativeModules,
  PixelRatio,
  Platform,
  type AlertButton,
  type AppStateStatus,
  type NativeModule
} from 'react-native'
import * as NavigationBar from 'expo-navigation-bar'
import * as RNDI from 'react-native-device-info'
import { VolumeManager } from 'react-native-volume-manager'
import * as Haptics from 'expo-haptics'
import { analytics } from '../helpers/analytics'
import { logger } from '../helpers/logger'

const deviceInfoEmitter = new NativeEventEmitter(NativeModules.RNDeviceInfo as NativeModule)

type TState = 'start' | 'loading' | 'in-game' | 'error'
type TDevicePerformanceClass = 'low' | 'medium' | 'high'

export type TAlertButtons = { text: string; onPress?: () => void }[]

export type TNewsItem = {
  title: string
  linkUrl: string
}

type TDeviceAudioSettings = {
  volume: number
  headphonesConnected: boolean
  isMuted?: boolean
}

export class UiConfirmCanceledError extends Error {
  constructor() {
    super('User canceled in confirmation dialog.')
    this.name = UiConfirmCanceledError.name
  }

  static name = 'UiConfirmCanceledError'
}

const HideNavigationBar = () => {
  if (Platform.OS === 'android') NavigationBar.setVisibilityAsync('hidden')
}

export class UiStore {
  constructor(private readonly settings: SettingsStore) {
    this.initiateScreenReader()

    HideNavigationBar()
    AppState.addEventListener('change', this.handleApplicationStateChange)

    this.initiateAudioListeners()
  }

  accessibilityFocusRefs: Record<number | string, React.LegacyRef<any>> = {}
  accessibilityFocusTimeouts: Record<string, ReturnType<typeof setTimeout>> = {}
  @observable state: TState = 'loading'
  @observable loadingStatus: string | null = null
  @observable screenReaderEnabled = false
  @observable popoverRef: React.RefObject<React.Component> | null = null
  popoverContent: React.ReactNode | null = null

  @observable newsItems: TNewsItem[] = []
  previousNewsItem = null

  deviceAudioSettings: TDeviceAudioSettings = {
    volume: 0,
    headphonesConnected: false,
    isMuted: undefined
  }

  @computed get popoverVisible() {
    return !!this.popoverRef
  }

  @action getNews = async () => {
    const { newsFeed } = this.settings.config
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    try {
      const response = await fetch(newsFeed.url, {
        signal: controller.signal,
        headers: {
          Expires: '0',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache'
        }
      })
      const json = await response.json()

      if (typeof json === 'object') {
        this.newsItems = json
      }

      clearTimeout(timeoutId)
    } catch (err) {
      logger.warn(err)
    }
  }

  trackUserAudioSetting = (settings: Partial<TDeviceAudioSettings>) => {
    Object.assign(this.deviceAudioSettings, settings)

    const { volume, headphonesConnected, isMuted } = this.deviceAudioSettings
    const audioEnabled = volume > 0 && (headphonesConnected || isMuted !== true)

    analytics.addUserProperty({ audioEnabled, volume: volume.toFixed(1), headphonesConnected })
  }

  private readonly setInitialDeviceAudioSettings = async () => {
    const volumeResults = await VolumeManager.getVolume()
    const headphonesConnected = await RNDI.isHeadphonesConnected()

    this.trackUserAudioSetting({
      volume:
        typeof volumeResults === 'object' && 'volume' in volumeResults
          ? volumeResults.volume
          : volumeResults,
      headphonesConnected
    })
  }

  @action openPopover = (ref: React.RefObject<React.Component>, content: React.ReactNode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    this.popoverContent = content
    this.popoverRef = ref
  }

  @action closePopover = () => {
    this.popoverRef = null
  }

  prunePopover = () => {
    this.popoverContent = null
  }

  initiateAudioListeners = async () => {
    const { trackUserAudioSetting } = this

    try {
      await this.setInitialDeviceAudioSettings()
    } catch (err) {
      logger.error(err as Error)
    }

    VolumeManager.addVolumeListener(status => {
      trackUserAudioSetting({ volume: status.volume })
    })

    VolumeManager.addSilentListener(status => {
      trackUserAudioSetting({ isMuted: status.isMuted })
    })

    deviceInfoEmitter.addListener('RNDeviceInfo_headphoneConnectionDidChange', enabled => {
      trackUserAudioSetting({ headphonesConnected: enabled })
    })
  }

  initiateScreenReader = async () => {
    AccessibilityInfo.addEventListener('screenReaderChanged', this.setScreenReaderValue)
    const value = await AccessibilityInfo.isScreenReaderEnabled()
    this.setScreenReaderValue(value)
  }

  @action setScreenReaderValue = (value: boolean) => {
    this.screenReaderEnabled = value
    analytics.addUserProperty({ screenReaderEnabled: value })
  }

  setAccessibilityRef = (id: number | string, el: React.LegacyRef<any>) => {
    if (!this.screenReaderEnabled) {
      return
    }

    this.accessibilityFocusRefs[id] = el
  }

  setAccessibilityFocus = (id: number | string, timeout = 25) => {
    const { accessibilityFocusRefs, accessibilityFocusTimeouts, screenReaderEnabled } = this

    if (!screenReaderEnabled) {
      return
    }

    // Clear all existing timeouts
    for (const ref in accessibilityFocusTimeouts) {
      if (accessibilityFocusTimeouts[ref]) {
        clearTimeout(accessibilityFocusTimeouts[ref])
      }
    }

    accessibilityFocusTimeouts[id] = setTimeout(() => {
      const element = accessibilityFocusRefs[id]

      if (element) {
        // Using try/catch here since findNodeHandle throws an error if the component
        // is unmounted, which is often the case due to the timeout. But without the
        // timeout, setAccessibilityFocus isn't working as expected.
        //
        // @TODO: In the future, when setAccessibilityFocus hopefully gets its shit
        // together and works instantly as it should, it ought to be safe to remove
        // the timeout (and clearing of it)
        try {
          const reactTag = findNodeHandle(element)

          if (reactTag) {
            AccessibilityInfo.setAccessibilityFocus(reactTag)
          }
        } catch (error) {
          logger.debug(error)
        }
      }
    }, timeout)
  }

  @action setLoading = (message: string) => {
    this.changeState('loading')

    if (message) {
      this.loadingStatus = message
    }
  }

  @action changeState = (state: TState) => {
    if (state !== this.state) {
      this.state = state

      logger.sentry?.addBreadcrumb({
        category: 'navigation',
        message: state
      })
    }

    if (state !== 'loading' && this.loadingStatus !== null) {
      this.loadingStatus = null
    }
  }

  alert = (
    title: string = '',
    message: string = '',
    buttons: TAlertButtons = [],
    options = { onDismiss: () => {} }
  ) => {
    if (!buttons.length) {
      buttons.push({
        text: t('UI-ALERT-OK_BUTTON-LABEL'),
        onPress: HideNavigationBar
      })
    }

    // Force "immersive" mode after any button press
    buttons.forEach(button => {
      const previousOnPress = button.onPress

      button.onPress = () => {
        if (previousOnPress) {
          previousOnPress()
        }

        HideNavigationBar()
      }
    })

    Alert.alert(title, message, buttons, options)
  }

  readonly calculateDevicePerformanceClass = async () => {
    this.devicePerformanceClass = await this.getDevicePerformanceClass()
  }

  readonly getDevicePerformanceClass = async (): Promise<TDevicePerformanceClass | undefined> => {
    try {
      if (Platform.OS === 'ios' || Platform.OS === 'macos') {
        return 'high'
      }

      const performanceInfo = await this.getDevicePerformanceInfo()

      if (
        performanceInfo.isLowRamDevice ||
        performanceInfo.isEmulator ||
        performanceInfo.pixelRatio <= 2 ||
        performanceInfo.totalMemory < 4000000000 // 4 GB
      ) {
        return 'low'
      }

      if (
        performanceInfo.totalMemory < 6000000000 // 6 GB
      ) {
        return 'medium'
      }
    } catch (error) {
      logger.debug(error)
    }
  }

  private readonly getDevicePerformanceInfo = async () => {
    const totalMemory = await RNDI.getTotalMemory()
    const isEmulator = await RNDI.isEmulator()
    const isLowRamDevice = RNDI.isLowRamDevice()
    const pixelRatio = PixelRatio.get()

    return {
      totalMemory,
      isEmulator,
      isLowRamDevice,
      pixelRatio
    }
  }

  devicePerformanceClass?: TDevicePerformanceClass

  confirm = (title: string = '', message: string = '', customContinueButtons?: string[]) =>
    new Promise<number | undefined>((resolve, reject) => {
      // Force "immersive" mode after any button press
      const immersionWrapper = (func: () => void) => {
        return () => {
          HideNavigationBar()
          func()
        }
      }

      const buttons: AlertButton[] = [
        {
          text: t('UI-CONFIRM-CANCEL_BUTTON-LABEL'),
          onPress: immersionWrapper(() => reject(new UiConfirmCanceledError())),
          style: 'cancel' as const
        }
      ]

      if (customContinueButtons) {
        buttons.push(
          ...customContinueButtons.map((label, index) => ({
            text: label,
            onPress: immersionWrapper(() => {
              resolve(index)
            })
          }))
        )
      } else {
        buttons.push({
          text: t('UI-CONFIRM-CONTINUE_BUTTON-LABEL'),
          onPress: immersionWrapper(() => resolve(undefined))
        })
      }

      Alert.alert(title, message, buttons, { onDismiss: reject })
    })

  handleApplicationStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      HideNavigationBar()
    }
  }
}

export default UiStore
