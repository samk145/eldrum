import type { Stores } from '../../stores'
import React from 'react'
import { I18nManager, Platform, StatusBar, UIManager, StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { onReactionError } from 'mobx'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { PortalProvider } from '@gorhom/portal'
import { StoresProvider } from '../../contexts/stores'
import { logger } from '../../helpers/logger'
import { useCustomDevSettings } from '../../hooks/useCustomDevSettings'
import { Popover } from '../units'

try {
  I18nManager.allowRTL(false)
} catch (error: any) {
  logger.error(error)
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

onReactionError(async (error: unknown) => {
  logger.error(error)
})

type TAppWrapperProps = {
  stores: Stores
  children?: React.ReactNode
}

export const AppWrapper = ({ stores, children }: TAppWrapperProps) => {
  useCustomDevSettings(stores)

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar hidden />
      <StoresProvider stores={stores}>
        <SafeAreaProvider>
          <PortalProvider>{children}</PortalProvider>
          <Popover />
        </SafeAreaProvider>
      </StoresProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})
