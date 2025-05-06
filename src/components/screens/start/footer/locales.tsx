import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet } from 'react-native'
import { Button, CardModal, Text, LoadingIndicator } from '../../../units'
import { DEFAULT_LOCALE } from '../../../../models/database/schemas/settings'
import { useConfig, useStores } from '../../../../contexts'
import { useDimensions } from '../../../../hooks'
import { variables, styles } from '../../../../styles'
import iso6391 from './iso-639-1.json'

type TLocalesProps = {
  open: boolean
  closeFn: () => void
}

export const Locales = ({ open, closeFn }: TLocalesProps) => {
  const config = useConfig()
  const [isLoading, setIsLoading] = React.useState(false)
  const { t, i18n } = useTranslation()
  const { content, settings } = useStores()
  const { insets } = useDimensions()

  const onLanguageSelect = async (localeCode: string) => {
    if (__DEV__ || config.environment === 'development') {
      setIsLoading(true)

      if (localeCode !== DEFAULT_LOCALE) {
        await content.loadRemoteTranslations([localeCode])
      }
    }

    await settings.changeLocale(localeCode)

    closeFn()
    setIsLoading(false)
  }

  return (
    <CardModal
      useOverlay
      onOverlayPress={closeFn}
      visible={open}
      onHandleDragSuccess={closeFn}
      handleDragSuccessThreshold={40}
    >
      <View style={[style.container, { marginBottom: insets.bottom + variables.distance * 2 }]}>
        {isLoading ? (
          <LoadingIndicator
            size={variables.distance * 10}
            style={{ marginVertical: variables.distance * 2 }}
          />
        ) : (
          <>
            <Text style={style.headline}>{t('SETTINGS-I18N-SELECT_LANGUAGE-TITLE')}</Text>

            {content.supportedLocales.map((localeCode: string) => {
              return (
                <View key={localeCode}>
                  <Button
                    disabled={i18n.language === localeCode}
                    key={localeCode}
                    label={
                      iso6391.find(isoValue => isoValue['639-1 code'] === localeCode)?.[
                        'Native name (endonym)'
                      ]
                    }
                    onPress={() => onLanguageSelect(localeCode)}
                  />
                </View>
              )
            })}
          </>
        )}
      </View>
    </CardModal>
  )
}

const style = StyleSheet.create({
  container: {
    marginHorizontal: variables.distance,
    gap: variables.distance / 2
  },
  headline: {
    ...styles.headline,
    textAlign: 'center',
    marginBottom: variables.distance / 2
  }
})
