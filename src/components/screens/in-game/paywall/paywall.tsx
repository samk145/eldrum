import React, { useCallback, useEffect, useState } from 'react'
import { Linking } from 'react-native'
import { observer } from 'mobx-react'
import { useStores, useGameStore, useConfig } from '../../../../contexts/stores'
import { logger } from '../../../../helpers/logger'
import { analytics } from '../../../../helpers/analytics'
import { CardModal } from '../../../units'
import PaywallSuccess from './paywall-success'
import PaywallLoading from './paywall-loading'
import PaywallDefault from './paywall-default'

enum AnalyticsEvents {
  REACHED_PAYWALL = 'Paywall Reached',
  CONTINUED_THROUGH_PAYWALL = 'Continued Through Paywall',
  BACKED_OUT_OF_PAYWALL = 'Backed Out of Paywall'
}

const ANALYTICS_CONTEXT = 'paywall'

const Paywall = () => {
  const config = useConfig()
  const stores = useStores()
  const game = useGameStore()
  const { purchase } = stores
  const [selectedProduct, setSelectedProduct] = useState<string | null>(config.productSKUs.premium)

  const shouldBeVisible =
    !!config.paywallOptionId &&
    !purchase.access &&
    game.statistics.hasUsedOption(config.paywallOptionId)
  const [visible, setVisibility] = useState(shouldBeVisible)

  if (!config.productSKUs.basic || !config.paywallOptionId) {
    logger.error(
      'Attempting to render Paywall component without a valid betaEndOptionId and/or paywallOptionId.'
    )
    return null
  }

  useEffect(() => {
    if (purchase.isConfigured && shouldBeVisible) {
      setVisibility(true)
      purchase.openStore()
      analytics.event(AnalyticsEvents.REACHED_PAYWALL)

      return purchase.closeStore
    }
  }, [shouldBeVisible])

  const handlePurchase = () => {
    selectedProduct && purchase.initiatePurchase(selectedProduct)
  }

  const handleContinue = useCallback(() => {
    setVisibility(false)
    analytics.event(AnalyticsEvents.CONTINUED_THROUGH_PAYWALL)
  }, [])

  const handleLinkPress = async (url: string) => {
    try {
      await Linking.openURL(url)
      analytics.linkEvent(url, ANALYTICS_CONTEXT)
    } catch (error) {}
  }

  const handleGoBack = () => {
    stores.ui.changeState('start')
    analytics.event(AnalyticsEvents.BACKED_OUT_OF_PAYWALL)
  }

  const handleSelectProduct = (productId: string) => {
    setSelectedProduct(productId)
  }

  return (
    <CardModal
      useOverlay
      useHandler={false}
      overlayOpacity={0.5}
      visible={visible}
      onOverlayPress={handleGoBack}
    >
      {purchase.awaitingResponse ? (
        <PaywallLoading />
      ) : purchase.access ? (
        <PaywallSuccess handleContinue={handleContinue} />
      ) : (
        <PaywallDefault
          handleSelectProduct={handleSelectProduct}
          selectedProduct={selectedProduct}
          productsObject={purchase.productsObject}
          handleLinkPress={handleLinkPress}
          handlePurchase={handlePurchase}
        />
      )}
    </CardModal>
  )
}

export default observer(Paywall)
