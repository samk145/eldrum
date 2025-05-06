import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  type ImageSourcePropType,
  BackHandler,
  type NativeEventSubscription
} from 'react-native'
import { observer } from 'mobx-react'
import * as SplashScreen from 'expo-splash-screen'
import { Image } from 'expo-image'
import { useStores, useConfig } from '../../../contexts'
import { dimensions, variables } from '../../../styles'
import { AccessibilityFocus, Button, Text, Highlighter, LoadingIndicator } from '../../units'
import { LimitReachedAlert, UpgradeAlert } from '../../structures'
import { AccessType } from '../../../stores/purchase'
import { SaveType } from '../../../models/database/schemas/save'
import { analytics } from '../../../helpers/analytics'
import { logger } from '../../../helpers/logger'
import Achievements from './achievements/achievements'
import News from './news/news'
import Load from './load/load'
import Logo from './logo/logo'
import Footer from './footer/footer'
import DemoDisclaimer from './demo-disclaimer/demo-disclaimer'
import Store from './store/store'
import style from './start.style'
import { useTranslation } from 'react-i18next'

const FADE_IN_ANIMATION_DURATION = 250
const ANALYTICS_SCREEN_NAME = 'start'

type TScreen = 'main' | 'load' | 'achievements' | 'store'

export type TStartProps = {
  backgroundImage: ImageSourcePropType
  logo: {
    accessibilityLabel: string
    large: {
      xml: string
      originalDimensions: { width: number; height: number }
    }
    small: {
      xml: string
      originalDimensions: { width: number; height: number }
    }
  }
}

export const Start = observer(function Start({ backgroundImage, logo }: TStartProps) {
  const config = useConfig()
  const { t } = useTranslation()
  const { play, saves, purchase, achievements, ui, system } = useStores()
  const [screen, setScreen] = useState<TScreen>('main')
  const [limitReachedVisible, setLimitReachedVisible] = useState(false)
  const [upgradeAlertVisible, setUpgradeAlertVisible] = useState(false)
  const androidBackHandler = useRef<NativeEventSubscription>()

  const loading = ui.state === 'loading'
  const error = ui.state === 'error'
  const loadingMessage = ui.loadingStatus

  const changeScreen = (screen: TScreen) => {
    setScreen(screen)
    analytics.screen(`${ANALYTICS_SCREEN_NAME}/${screen}`)

    if (screen !== 'main') {
      androidBackHandler.current = BackHandler.addEventListener('hardwareBackPress', () => {
        changeScreen('main')
        return true
      })
    }

    if (screen === 'main' && androidBackHandler.current) {
      androidBackHandler.current.remove()
    }

    logger.sentry?.addBreadcrumb({
      category: 'navigation',
      message: `start - ${screen}`
    })
  }

  useEffect(() => {
    return () => {
      if (androidBackHandler.current) {
        androidBackHandler.current.remove()
      }
    }
  }, [])

  const handleNewGame = () => {
    if (saves.playthroughs.length >= config.maxPlaythroughsPremium) {
      setLimitReachedVisible(true)
      return
    }

    if (
      saves.playthroughs.length >= config.maxPlaythroughs &&
      purchase.access < AccessType.premium
    ) {
      setUpgradeAlertVisible(true)
      return
    }

    if (play.game) {
      ui.alert(t('START-NEW-GAME-WARNING-TITLE'), t('START-NEW-GAME-WARNING-TEXT'), [
        {
          text: t('START-NEW-GAME-WARNING-CANCEL-LABEL'),
          onPress: () => {}
        },
        {
          text: t('START-NEW-GAME-WARNING-OK-LABEL'),
          onPress: async () => {
            await play.newGame()
          }
        }
      ])
    } else {
      play.newGame()
    }
  }

  const handleSaveGame = async () => {
    await play.saveToWithPlayTime(SaveType.manual)
    play.continueGame()
  }

  if (!system.fontsAreLoaded) {
    return null
  }

  const renderMain = () => {
    return (
      <>
        <View style={style.mainWrapper}>
          <Logo
            width={style.menuWrapper.width * 1.2}
            style={style.logoWrapper}
            xml={dimensions.height > 800 ? logo.large.xml : logo.small.xml}
            originalDimensions={
              dimensions.height > 800
                ? logo.large.originalDimensions
                : logo.small.originalDimensions
            }
            accessibilityLabel={logo.accessibilityLabel}
          />

          {!error && (
            <View style={style.menuWrapper}>
              {!purchase.access && purchase.products.length > 0 && (
                <DemoDisclaimer onPress={() => changeScreen('store')} />
              )}

              {!play.game && saves.hasAnySave && !play.gameWasJustCompleted && (
                <AccessibilityFocus id="StartContinue" style={style.buttonWrapper} delay={15}>
                  <Button
                    label={t('START-BUTTON-CONTINUE-LABEL')}
                    onPress={() => play.loadFromLatestSave()}
                    onLoadAnimationDuration={FADE_IN_ANIMATION_DURATION}
                  />
                </AccessibilityFocus>
              )}

              {play.game && play.game.isRunning && (
                <AccessibilityFocus id="StartContinue" style={style.buttonWrapper} delay={15}>
                  <Button
                    label={t('START-BUTTON-CONTINUE-LABEL')}
                    onPress={play.continueGame}
                    onLoadAnimationDuration={FADE_IN_ANIMATION_DURATION}
                  />
                </AccessibilityFocus>
              )}

              <Button
                wrapperStyle={style.buttonWrapper}
                label={
                  !saves.hasAnySave
                    ? t('START-BUTTON-NEW-GAME-LABEL-A')
                    : t('START-BUTTON-NEW-GAME-LABEL-B')
                }
                onPress={handleNewGame}
                size={saves.hasAnySave ? 'small' : 'regular'}
                onLoadAnimationDuration={FADE_IN_ANIMATION_DURATION}
              />

              {play.game && play.game.isRunning && play.game.character.alive && (
                <Button
                  wrapperStyle={style.buttonWrapper}
                  label={t('START-BUTTON-SAVE-GAME-LABEL')}
                  size="small"
                  onPress={handleSaveGame}
                  onLoadAnimationDuration={FADE_IN_ANIMATION_DURATION}
                />
              )}

              {ui.state !== 'loading' && saves.hasLoadableSave && (
                <Button
                  wrapperStyle={style.buttonWrapper}
                  label={t('START-BUTTON-LOAD-GAME-LABEL')}
                  size="small"
                  onPress={() => changeScreen('load')}
                  onLoadAnimationDuration={FADE_IN_ANIMATION_DURATION}
                />
              )}

              {saves.hasAnySave && (
                <View style={style.menuBottomWrapper}>
                  <Highlighter
                    highlight={achievements.hasUpdate}
                    wrapperStyle={style.buttonWrapperSmall}
                    position="top-right"
                    size={variables.distance / 2}
                    customOffset={{ right: variables.distance / 3, top: 0 }}
                  >
                    <Button
                      wrapperStyle={!achievements.hasUpdate ? style.buttonWrapperSmall : undefined}
                      label={t('START-BUTTON-ACHIEVEMENTS-LABEL')}
                      size="small"
                      onPress={() => changeScreen('achievements')}
                      onLoadAnimationDuration={FADE_IN_ANIMATION_DURATION}
                    />
                  </Highlighter>
                  <Button
                    wrapperStyle={[style.buttonWrapperSmall, style.menuBottomLastChild]}
                    label={t('START-BUTTON-STORE-LABEL')}
                    size="small"
                    onPress={() => changeScreen('store')}
                    onLoadAnimationDuration={FADE_IN_ANIMATION_DURATION}
                  />
                </View>
              )}
            </View>
          )}
        </View>
        {dimensions.height > 650 && saves.hasAnySave && <News />}
        <UpgradeAlert
          onDismiss={() => setUpgradeAlertVisible(false)}
          visible={upgradeAlertVisible}
          onPurchaseFinished={handleNewGame}
        />
        <LimitReachedAlert
          onDismiss={() => setLimitReachedVisible(false)}
          visible={limitReachedVisible}
        />
        <Footer />
      </>
    )
  }

  return (
    <View
      style={[style.wrapper, { backgroundColor: config.startMenuBackgroundColor || 'transparent' }]}
      onLayout={SplashScreen.hide}
    >
      {loading ? (
        <>
          <LoadingIndicator />
          <Text style={style.loadingStatus}>{loadingMessage}</Text>
        </>
      ) : (
        <React.Fragment>
          {screen === 'main' && renderMain()}
          {screen === 'store' && <Store backAction={() => changeScreen('main')} />}

          {screen === 'achievements' && (
            <Achievements
              backAction={() => {
                changeScreen('main')
                achievements.markUpdatesAsSeen()
              }}
            />
          )}
          {screen === 'load' && (
            <Load backAction={() => changeScreen('main')} lockPlaythrough={false} />
          )}
        </React.Fragment>
      )}
      <Image
        style={style.backgroundImage}
        source={backgroundImage}
        contentFit="cover"
        cachePolicy="memory"
        transition={175}
      />
    </View>
  )
})
