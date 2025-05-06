import { observer } from 'mobx-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet } from 'react-native'
import { useStores } from '../../../contexts/stores'
import { variables, helpers } from '../../../styles'
import { Text } from '../text/text'

const { fonts, colors, distance } = variables

const PremiumPrice = () => {
  const { t } = useTranslation()
  const {
    purchase: {
      premiumValue,
      productsObject: { premium }
    }
  } = useStores()

  return (
    <View
      style={style.wrapper}
      accessible
      accessibilityLabel={`${t('PRODUCT-PRICE-LABEL')}: ${premium?.localizedPrice}`}
    >
      {premiumValue && <Text style={style.value}>{premiumValue}</Text>}
      <Text style={style.price}>{premium?.localizedPrice}</Text>
    </View>
  )
}

const style = StyleSheet.create({
  wrapper: {
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  value: {
    fontFamily: fonts.demi,
    ...helpers.FontSizeAndLineHeight(fonts.body - 6),
    color: colors.white,
    textDecorationLine: 'line-through',
    letterSpacing: distance / 25,
    marginBottom: distance / 4
  },
  price: {
    ...helpers.FontSizeAndLineHeight(fonts.body - 2),
    color: colors.white,
    marginLeft: distance / 2
  }
})

export default observer(PremiumPrice)
