import React, { useEffect, useRef } from 'react'
import { View, TouchableOpacity, BackHandler, type NativeEventSubscription } from 'react-native'
import { useDimensions } from '../../../../hooks/dimensions'
import { observer } from 'mobx-react'
import { useTranslation } from 'react-i18next'
import { useStores, useGameStore, useConfig } from '../../../../contexts/stores'
import { Rect } from '../../../../helpers/misc'
import { useScreenReaderInfo } from '../../../../hooks'
import { variables, helpers } from '../../../../styles'
import { Highlighter, Text, ProgressBar, Icon } from '../../../units'
import { Opener } from './content-inspector/content-inspector'
import { Stat, style as statStyle } from './stat'
import style from './stat-bar.style'

const { colors } = variables
const hitSlop = Rect(10, 10, 10, 10)

const StatBar = observer(() => {
  const { t } = useTranslation()
  const config = useConfig()
  const stores = useStores()
  const game = useGameStore()
  const androidBackHandler = useRef<NativeEventSubscription>()
  const screenReaderEnabled = useScreenReaderInfo()
  const { insets } = useDimensions()

  const openMenu = () => {
    stores.ui.changeState('start')
  }

  useEffect(() => {
    androidBackHandler.current = BackHandler.addEventListener('hardwareBackPress', () => {
      if (game.combat) {
        return true
      }

      openMenu()
      return true
    })

    return () => {
      if (androidBackHandler.current) {
        androidBackHandler.current.remove()
      }
    }
  }, [])

  return (
    <View style={{ paddingTop: insets.top - 20 }}>
      <View style={[style.inner, { opacity: stores.settings.values.cinematicModeEnabled ? 0 : 1 }]}>
        <View style={style.statsWrapper}>
          <View style={statStyle.container}>
            <Text style={statStyle.label} accessible={false}>
              {t('CHARACTER-DERIVATIVE-HEALTH_POINTS-ACRO')}
            </Text>
            <View
              style={[
                { width: helpers.getSizeValue(65, 50, 45), marginRight: variables.distance / 2 }
              ]}
            >
              <ProgressBar
                accessibilityLabel={t('CHARACTER-DERIVATIVE-HEALTH_POINTS')}
                color={[colors.lowHealth, colors.highHealth]}
                borderRadius={5}
                value={game.character.health}
                maxValue={game.character.maxHealth}
                screenReaderEnabled={screenReaderEnabled}
              />
            </View>
          </View>

          <Stat
            label={t('CHARACTER-LEVEL')}
            abbreviation={t('CHARACTER-LEVEL-ABBR')}
            value={game.character.level}
            valueWidth={20}
          />
          <Stat
            label={t('CHARACTER-DERIVATIVE-ENCUMBRANCE')}
            abbreviation={t('CHARACTER-DERIVATIVE-ENCUMBRANCE-ABBR')}
            value={game.character.encumbrance}
            maxValue={game.character.maxEncumbrance}
            valueWidth={45}
          />
          <Stat label={t('CHARACTER-STAT-GOLD')} value={game.character.gold} valueWidth={80} />
        </View>

        {config.enableContentInspector && <Opener />}

        <Highlighter
          highlight={stores.achievements.hasUpdate}
          position="top-right"
          size={variables.distance / 2}
        >
          <TouchableOpacity
            accessibilityLabel={t('STAT-BAR-MAIN-MENU-TITLE')}
            touchSoundDisabled={true}
            style={style.menu}
            hitSlop={hitSlop}
            onPress={openMenu}
          >
            <Icon name="menu" height={style.menuIcon.height} width={style.menuIcon.width} />
          </TouchableOpacity>
        </Highlighter>
      </View>
    </View>
  )
})

export default StatBar
