import React, { useState } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { observer } from 'mobx-react'
import DeviceInfo from 'react-native-device-info'
import { useTranslation } from 'react-i18next'
import { useStores, useConfig } from '../../../../contexts'
import { analytics } from '../../../../helpers/analytics'
import { Text, Icon } from '../../../units'
import { SocialLinks } from '../../../structures'
import Credits from '../credits/credits'
import { Locales } from './locales'
import style from './footer.style'

const ANALYTICS_CONTEXT = 'footer'

const HITSLOP = { top: 10, bottom: 10, left: 10, right: 10 }

const Footer = () => {
  const config = useConfig()
  const { settings } = useStores()
  const { t } = useTranslation()
  const [creditsVisible, setCreditsVisible] = useState(false)
  const [localeSelectorVisible, setLocaleSelectorVisible] = useState(false)

  const handleSoundToggle = () => {
    settings.changeSetting('soundEnabled', !settings.values.soundEnabled)
  }

  const toggleCredits = () => {
    setCreditsVisible(!creditsVisible)
  }

  const closeLocaleSelector = () => {
    setLocaleSelectorVisible(false)
  }

  const openLocaleSelector = () => {
    setLocaleSelectorVisible(true)
  }

  const identifier = __DEV__
    ? `${config.version} (${config.environment})`
    : `${config.version} (${DeviceInfo.getBuildNumber()})`

  return (
    <View style={style.bottomWrapper}>
      <View style={style.settingsContainer}>
        <TouchableOpacity
          accessibilityLabel={
            settings.values.soundEnabled
              ? t('SETTINGS-AUDIO-TOGGLE_ON-A11Y_LABEL')
              : t('SETTINGS-AUDIO-TOGGLE_OFF-A11Y_LABEL')
          }
          hitSlop={HITSLOP}
          style={style.settingsIconWrapper}
          touchSoundDisabled={true}
          onPress={handleSoundToggle}
        >
          <Icon
            name={settings.values.soundEnabled ? 'soundOn' : 'soundOff'}
            height={style.settingsIconWrapper.height}
            width={style.settingsIconWrapper.width}
            fill="#FFFFFF"
          />
        </TouchableOpacity>
        {(config.supportedLocales?.length > 1 || __DEV__) && (
          <TouchableOpacity
            accessibilityLabel={t('SETTINGS-I18N-CHANGE_LANGUAGE-LABEL')}
            hitSlop={HITSLOP}
            style={style.settingsIconWrapper}
            touchSoundDisabled={true}
            onPress={openLocaleSelector}
          >
            <Icon
              name={'i18n'}
              height={style.settingsIconWrapper.height}
              width={style.settingsIconWrapper.width}
              fill="#FFFFFF"
            />
          </TouchableOpacity>
        )}
      </View>
      <SocialLinks afterLinkPress={({ url }) => analytics.linkEvent(url, ANALYTICS_CONTEXT)} />
      <View style={style.bottomTextWrapper}>
        <View style={style.bottomTextRow}>
          <Text style={style.bottomText}>&copy; {config.copyrightYear} Act None</Text>
          <Text style={style.bottomText}> • </Text>
          <Text style={style.bottomText}>{identifier}</Text>
          <Text style={style.bottomText}> • </Text>
          <TouchableOpacity
            hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
            onPress={toggleCredits}
            style={[style.restoreLink]}
          >
            <Text style={style.bottomText}>{t('START-FOOTER-CREDITS-LABEL')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Credits buttonAction={toggleCredits} visible={creditsVisible} />
      <Locales open={localeSelectorVisible} closeFn={closeLocaleSelector} />
    </View>
  )
}

export default observer(Footer)
