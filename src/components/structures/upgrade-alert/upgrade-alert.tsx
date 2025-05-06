import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useStores } from '../../../contexts/stores'
import { AccessType } from '../../../stores/purchase'
import { AccessProduct } from '../../units/access-product/access-product'
import {
  AlertCardModal,
  type IAlertButton,
  type IAlertCardModalProps
} from '../../units/alert-card-modal/alert-card-modal'
import style from './upgrade-alert.style'

interface IUpgradeAlertProps extends Pick<IAlertCardModalProps, 'visible' | 'onDismiss'> {
  type?: 'newGame' | 'branch'
  onPurchaseFinished?: () => void
}

export const UpgradeAlert = observer(function UpgradeAlert({
  type = 'newGame',
  onDismiss,
  visible,
  onPurchaseFinished
}: IUpgradeAlertProps) {
  const { t } = useTranslation()
  const { purchase } = useStores()

  useEffect(() => {
    if (purchase.isConfigured) {
      purchase.openStore()

      return purchase.closeStore
    }
  }, [])

  if (!purchase.products.length) {
    return null
  }

  const {
    productsObject: { premium, premiumUpgrade }
  } = purchase
  const hasBasicAccess = purchase.access === AccessType.basic
  const product = hasBasicAccess ? premiumUpgrade : premium
  const currentEditionName = hasBasicAccess
    ? t('PURCHASE-BASIC_EDITION_NAME')
    : t('PURCHASE-DEMO_EDITION_NAME')
  const text =
    type === 'branch'
      ? t('UPGRADE_ALERT-BRANCH-DESC', {
          currentEditionName,
          premiumEditionName: t('PURCHASE-PREMIUM_EDITION_NAME')
        })
      : t('UPGRADE_ALERT-NEW_GAME-DESC', {
          currentEditionName,
          number: purchase.maxPlaythroughs,
          premiumEditionName: t('PURCHASE-PREMIUM_EDITION_NAME')
        })
  const title =
    type === 'branch' ? t('UPGRADE_ALERT-BRANCH-TITLE') : t('UPGRADE_ALERT-NEW_GAME-TITLE')
  const buttons: IAlertButton[] = [
    {
      text: t('CONTINUE_BUTTON-LABEL'),
      onPress: async () => {
        if (product) {
          await purchase.initiatePurchase(product.productId)
        }
      }
    }
  ]
  const successButtons: IAlertButton[] = [
    {
      text: t('CONTINUE_BUTTON-LABEL'),
      onPress: async () => onPurchaseFinished && onPurchaseFinished()
    }
  ]

  return (
    <AlertCardModal
      onDismiss={onDismiss}
      visible={visible}
      title={title}
      text={text}
      buttons={buttons}
      loading={purchase.awaitingResponse}
      successData={{
        isSuccessful: purchase.access === AccessType.premium,
        buttons: successButtons
      }}
    >
      <View style={style.productWrapper}>
        {!!product && (
          <AccessProduct
            type={hasBasicAccess ? 'premiumUpgrade' : 'premium'}
            orientation="horizontal"
            selected={true}
          />
        )}
      </View>
    </AlertCardModal>
  )
})
