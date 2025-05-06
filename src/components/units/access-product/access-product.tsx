import React, { type ReactNode } from 'react'
import { type StyleProp, View, type ViewStyle } from 'react-native'
import { useStores } from '../../../contexts/stores'
import PremiumPrice from './premium-price'
import { Product } from '../product/product'
import { Text } from '../text/text'
import { type ProductType } from '../../../stores/purchase'

const premiumImage = require('./assets/product-premium.webp')
const basicImage = require('./assets/product-basic.webp')

interface IAccessProductProps {
  type: ProductType
  orientation?: 'horizontal' | 'vertical'
  selected?: boolean
  onPress?: () => void
  tag?: string
  style?: StyleProp<ViewStyle>
  price?: ReactNode
}

export const AccessProduct = ({
  type,
  selected,
  onPress,
  tag,
  style,
  orientation = 'vertical',
  price
}: IAccessProductProps) => {
  const { purchase } = useStores()
  const { productsObject } = purchase
  const product = productsObject[type]
  const image = type === 'basic' ? basicImage : premiumImage

  if (!product) {
    return (
      <View>
        <Text>{`No ${type} product found`}</Text>
      </View>
    )
  }

  const productPrice = (() => {
    if (price) {
      return price
    } else if (type === 'premium') {
      return <PremiumPrice />
    } else {
      return product.localizedPrice
    }
  })()

  return (
    <Product
      orientation={orientation}
      title={product.title}
      perks={product.perks}
      price={productPrice}
      image={image}
      selected={selected}
      onPress={onPress}
      tag={tag}
      style={style}
    />
  )
}
