import React from 'react'
import { ScrollView, View } from 'react-native'
// @ts-expect-error: Missing type definitions for 'react-native-markdown-view'
import { MarkdownView } from 'react-native-markdown-view'
import { useTranslation } from 'react-i18next'
import { AccessibilityFocus, Button, Text, AccessProduct } from '../../../units'
import { type ProductsObject } from '../../../../stores/purchase'
import style, { markdownStyle, buttonBackgroundColor } from './paywall-default.style'

const DISCORD_SERVER_URL = 'https://discord.eldrum.com'

type TPaywallDefaultProps = {
  productsObject: Partial<ProductsObject>
  selectedProduct: string | null
  handleSelectProduct: (id: string) => void
  handlePurchase: () => void
  handleLinkPress: (url: string) => void
}

const PaywallDefault = ({
  productsObject,
  selectedProduct,
  handlePurchase,
  handleLinkPress,
  handleSelectProduct
}: TPaywallDefaultProps) => {
  const { t } = useTranslation()
  const { basic, premium } = productsObject

  return (
    <ScrollView contentContainerStyle={style.wrapper}>
      <AccessibilityFocus id="paywall" focusOnUpdate={false}>
        <Text style={style.headline}>{t('PAYWALL-BUY-TITLE')}</Text>
      </AccessibilityFocus>
      <MarkdownView style={style.messageWrapper} styles={markdownStyle}>
        {t('PAYWALL-SUB_TITLE')}
      </MarkdownView>
      <View style={style.productsList}>
        {!!basic && (
          <AccessProduct
            type="basic"
            selected={basic.productId === selectedProduct}
            price={basic.localizedPrice}
            onPress={premium ? () => handleSelectProduct(basic.productId) : undefined}
          />
        )}
        {!!premium && (
          <AccessProduct
            type="premium"
            selected={premium.productId === selectedProduct}
            onPress={premium ? () => handleSelectProduct(premium.productId) : undefined}
            tag={t('PURCHASE-IAP_PROMOTED_TAG-LABEL')}
            style={style.lastProduct}
          />
        )}
      </View>
      {!!premium && (
        <Text style={style.branchingInfo}>{`*${t('STORE-PRODUCT-BRANCHING-DESC')}`}</Text>
      )}
      <Button
        tint={buttonBackgroundColor}
        wrapperStyle={style.buttonWrapper}
        labelStyle={style.buttonLabel}
        label={t('PAYWALL-BUY-BUTTON-LABEL')}
        onPress={handlePurchase}
      />
      <MarkdownView onLinkPress={handleLinkPress} styles={markdownStyle}>
        {t('PAYWALL-BUY-BOTTOM_TEXT', { url: DISCORD_SERVER_URL })}
      </MarkdownView>
    </ScrollView>
  )
}

export default PaywallDefault
