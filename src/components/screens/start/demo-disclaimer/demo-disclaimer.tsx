import React from 'react'
import { TouchableOpacity, type GestureResponderEvent } from 'react-native'
// @ts-expect-error: Missing type definitions for 'react-native-markdown-view'
import { MarkdownView } from 'react-native-markdown-view'
import { useTranslation } from 'react-i18next'
import { useConfig } from '../../../../contexts'
import { logger } from '../../../../helpers/logger'
import { Text } from '../../../units'
import style, { markdownStyle } from './demo-disclaimer.style'

type TDemoDisclaimerProps = {
  onPress: (event: GestureResponderEvent) => any
}

const DemoDisclaimer = ({ onPress }: TDemoDisclaimerProps) => {
  const config = useConfig()
  const { t } = useTranslation()

  if (!config.productSKUs.basic) {
    logger.error('Attempting to render DemoDisclaimer component without a valid product SKU.')
    return null
  }

  return (
    <TouchableOpacity
      accessible
      accessibilityLabel={`${t('DEMO-DISCLAIMER-TITLE')}. ${t('DEMO-DISCLAIMER-COPY').replace(/_/g, '')}`}
      accessibilityRole="button"
      style={style.wrapper}
      onPress={onPress}
    >
      <Text style={style.headline}>{t('DEMO-DISCLAIMER-TITLE')}</Text>
      <MarkdownView style={style.body} styles={markdownStyle}>
        {t('DEMO-DISCLAIMER-COPY')}
      </MarkdownView>
    </TouchableOpacity>
  )
}

export default DemoDisclaimer
