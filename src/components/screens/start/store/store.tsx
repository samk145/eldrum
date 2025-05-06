import React, { useEffect } from 'react'
import { View, type GestureResponderEvent, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import { observer } from 'mobx-react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useConfig, useStores } from '../../../../contexts/stores'
import { Button, Card, Text, AccessProduct, LoadingIndicator } from '../../../units'
import { type EnrichedProduct, AccessType } from '../../../../stores/purchase'
import style from './store.style'

type TStoreProps = {
  backAction: (e?: GestureResponderEvent) => void
}

const BUTTON_SIZE = 'small'
const BUTTON_ORIENTATION = 'horizontal'

const Store = ({ backAction }: TStoreProps) => {
  const { t } = useTranslation()
  const config = useConfig()
  const { purchase } = useStores()
  const { ownedProducts } = purchase
  const { basic, premiumUpgrade, premium } = purchase.productsObject
  const hasBoughtPremium = purchase.ownedProducts.includes('premium')

  useEffect(() => {
    if (purchase.isConfigured) {
      purchase.openStore()

      return purchase.closeStore
    }
  }, [])

  const handleRestorePurchase = async (e: GestureResponderEvent) => {
    await purchase.restorePurchases()
  }

  const handleResetPurchase = async (e: GestureResponderEvent) => {
    await purchase.deletePurchases()
  }

  const handlePurchase = async (productId: string) => {
    if (purchase.isConfigured) {
      purchase.initiatePurchase(productId)
    }
  }

  const getLabel = (product: EnrichedProduct) => {
    const { productType, localizedPrice } = product

    if (hasBoughtPremium) {
      return productType === 'premium'
        ? t('STORE-PRODUCT-ALREADY_OWNED-LABEL')
        : t('NOT_APPLICABLE_LABEL')
    }

    switch (productType) {
      case 'basic': {
        return ownedProducts.includes(productType)
          ? t('STORE-PRODUCT-ALREADY_OWNED-LABEL')
          : localizedPrice
      }
      case 'premiumUpgrade': {
        return ownedProducts.includes(productType)
          ? t('STORE-PRODUCT-ALREADY_OWNED-LABEL')
          : localizedPrice
      }
      default: {
        return localizedPrice
      }
    }
  }

  return (
    <SafeAreaView style={style.wrapper}>
      <Text style={style.header}>{t('STORE-HEADLINE')}</Text>

      <Card style={style.cardWrapper} corners="all">
        {purchase.awaitingResponse ? (
          <View style={style.loadingWrapper}>
            <LoadingIndicator size={150} />
          </View>
        ) : (
          <ScrollView style={style.productsListWrapper}>
            {basic && (
              <AccessProduct
                type="basic"
                orientation={BUTTON_ORIENTATION}
                style={style.productWrapper}
                price={
                  <Button
                    size={BUTTON_SIZE}
                    onPress={() => handlePurchase(basic.productId)}
                    label={getLabel(basic)}
                    disabled={purchase.access >= AccessType.basic}
                  />
                }
              />
            )}
            {premiumUpgrade && (
              <AccessProduct
                type="premiumUpgrade"
                orientation={BUTTON_ORIENTATION}
                style={style.productWrapper}
                price={
                  <Button
                    size={BUTTON_SIZE}
                    onPress={() => handlePurchase(premiumUpgrade.productId)}
                    label={getLabel(premiumUpgrade)}
                    disabled={
                      purchase.access >= AccessType.premium || !ownedProducts.includes('basic')
                    }
                  />
                }
              />
            )}
            {hasBoughtPremium && premium && (
              <AccessProduct
                type="premium"
                orientation={BUTTON_ORIENTATION}
                style={style.productWrapper}
                price={
                  <Button
                    size={BUTTON_SIZE}
                    onPress={() => handlePurchase(premium.productId)}
                    label={getLabel(premium)}
                    disabled={purchase.access >= AccessType.premium}
                  />
                }
              />
            )}
          </ScrollView>
        )}
      </Card>

      <View style={style.buttonWrapper}>
        <Button
          wrapperStyle={style.restorePurchasesButtonWrapper}
          label={t('STORE-RESTORE_PURCHASES_BUTTON-LABEL')}
          onPress={handleRestorePurchase}
        />
        {(config.environment === 'development' || __DEV__) && (
          <Button
            wrapperStyle={style.restorePurchasesButtonWrapper}
            label={t('STORE-RESET_PURCHASES_BUTTON-LABEL')}
            onPress={handleResetPurchase}
          />
        )}
        <Button size="regular" label={t('BUTTON-BACK-LABEL')} onPress={backAction} />
      </View>
    </SafeAreaView>
  )
}

export default observer(Store)
