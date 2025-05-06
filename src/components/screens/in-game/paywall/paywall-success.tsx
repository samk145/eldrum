import React, { memo } from 'react'
import { View } from 'react-native'
// @ts-expect-error: Missing type definitions for 'react-native-markdown-view'
import { MarkdownView } from 'react-native-markdown-view'
import { useTranslation } from 'react-i18next'
import { AccessibilityFocus, Button, Text } from '../../../units'
import style, { markdownStyle } from './paywall.style'

type TPaywallSuccessProps = {
  handleContinue: () => void
}

const PaywallSuccess = ({ handleContinue }: TPaywallSuccessProps) => {
  const { t } = useTranslation()

  return (
    <View style={style.wrapper}>
      <AccessibilityFocus id="paywall" focusOnUpdate={false}>
        <Text style={style.headline}>{t('PAYWALL-SUCCESS-TITLE')}</Text>
      </AccessibilityFocus>

      <MarkdownView styles={markdownStyle}>{t('PAYWALL-SUCCESS-DESC')}</MarkdownView>
      <Button
        wrapperStyle={style.buttonWrapper}
        label={t('PAYWALL-SUCCESS-BUTTON-LABEL')}
        onPress={handleContinue}
      />
    </View>
  )
}

export default memo(PaywallSuccess)
