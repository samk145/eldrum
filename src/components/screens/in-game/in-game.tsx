import React, { useEffect } from 'react'
import { View } from 'react-native'
import { observer } from 'mobx-react'
import { useTranslation } from 'react-i18next'
import { useGameStore, useConfig } from '../../../contexts/stores'
import { variables } from '../../../styles'
import { Marionette } from '../../units'
import { Reader } from '../../structures'

import ContentInspector from './stat-bar/content-inspector/content-inspector'
import StatBar from './stat-bar/stat-bar'
import Background from './background/background'
import BetaEnd from './beta-end/beta-end'
import Paywall from './paywall/paywall'
import Ending from './ending/ending'
import NarrativeAndOptions from './narrative-options/narrative-options'
import WorldMap from './world-map/world-map'
import BottomBar, { type TBottomBarProps } from './bottom-bar/bottom-bar'
import Wallpaper from './wallpaper/wallpaper'
import style from './in-game.style'
import { OverEncumbered } from './over-encumbered/over-encumbered'

export type TInGameProps = {
  combat?: React.ReactNode
  bottomBarProps?: TBottomBarProps
  children?: React.ReactNode
}

export const InGame = observer(function InGame({ combat, children, bottomBarProps }: TInGameProps) {
  const { t } = useTranslation()
  const game = useGameStore()
  const { _ui } = game
  const { getMarionette } = game.puppeteer
  const config = useConfig()

  useEffect(() => {
    const { puppeteer, statistics } = game

    if (statistics.getRecord('lastUsedOption')) {
      puppeteer.gameResume()
    } else {
      puppeteer.gameStart()
    }
  }, [])

  return (
    <View style={style.wrapper}>
      <Wallpaper />

      <Marionette
        style={style.background}
        name="background"
        isAccessible={_ui.screenReaderEnabled && getMarionette('background').isAccessible}
        state={getMarionette('background').state}
      >
        <Background />
      </Marionette>

      {combat && (
        <Marionette
          style={style.combat}
          name="combat"
          isAccessible={_ui.screenReaderEnabled && getMarionette('combat').isAccessible}
          state={getMarionette('combat').state}
        >
          {combat}
        </Marionette>
      )}

      <Marionette
        style={style.narrative}
        name="narrative"
        isAccessible={_ui.screenReaderEnabled && getMarionette('narrative').isAccessible}
        state={getMarionette('narrative').state}
      >
        <NarrativeAndOptions />
      </Marionette>

      <Marionette
        style={style.top}
        name="top"
        isAccessible={_ui.screenReaderEnabled && getMarionette('top').isAccessible}
        state={getMarionette('top').state}
      >
        <StatBar />
      </Marionette>

      <Marionette
        style={style.map}
        name="map"
        isAccessible={_ui.screenReaderEnabled && getMarionette('map').isAccessible}
        state={getMarionette('map').state}
      >
        {/* @ts-expect-error: WorldMap is missing required prop "stores" */}
        <WorldMap />
      </Marionette>

      {bottomBarProps && (
        <Marionette
          style={style.bottom}
          name="bottom"
          isAccessible={_ui.screenReaderEnabled && getMarionette('bottom').isAccessible}
          state={getMarionette('bottom').state}
        >
          <BottomBar {...bottomBarProps} />
        </Marionette>
      )}

      <Marionette
        style={style.ending}
        name="ending"
        isAccessible={_ui.screenReaderEnabled && getMarionette('ending').isAccessible}
        state={getMarionette('ending').state}
      >
        <Ending />
      </Marionette>

      <Reader
        visible={game.reader !== null}
        textColor={variables.colors.cinnamon}
        backgroundColor={variables.colors.parchment}
        content={t(`SCRIPTURE-${game.reader?._id}-CONTENT`, { ns: 'scriptures' })}
        buttonLabel={t('CLOSE-LABEL')}
        buttonAction={game.closeReader}
        buttonBackground={variables.colors.cinnamon}
      />

      {config.enableContentInspector && <ContentInspector />}
      {config.betaEndOptionId && <BetaEnd />}
      {config.paywallOptionId && <Paywall />}
      {children}
      <OverEncumbered />
    </View>
  )
})
