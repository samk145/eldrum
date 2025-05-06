import React from 'react'
import { View } from 'react-native'
import type { StyleProp, ViewProps, GestureResponderEvent } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Image, type ImageStyle, type ImageSource } from 'expo-image'
import { Text } from '../text/text'
import { Icon } from '../icon/icon'
import { variables } from '../../../styles'
import { useScreenReaderInfo } from '../../../hooks/accessibility'
import { isAlternateStyle } from '../../screens/in-game/paywall/paywall-default.style'
import Wrapper from './wrapper'
import getStyles, { iconColor } from './product.style'

const { colors } = variables

type TProductProps = {
  title: string
  perks?: string[]
  tag?: string
  price: React.ReactNode | string
  originalPrice?: string
  image?: ImageSource | undefined
  imageStyle?: StyleProp<ImageStyle>
  selected?: boolean
  orientation?: 'vertical' | 'horizontal'
  onPress?: (event: GestureResponderEvent) => any
} & ViewProps

export const Product = ({
  title,
  perks = [],
  tag,
  price,
  originalPrice,
  image,
  onPress,
  selected,
  imageStyle,
  orientation = 'vertical',
  ...viewProps
}: TProductProps) => {
  const { t } = useTranslation()
  const style = getStyles(orientation === 'horizontal' || isAlternateStyle)
  const { style: viewStyle, ...restViewProps } = viewProps
  const titleWithoutParenthesis = title.replace(/\s*\(.*?\)\s*/g, '').trim()
  const screenReaderEnabled = useScreenReaderInfo()

  return (
    <Wrapper
      style={[style.wrapper, viewStyle]}
      selected={selected}
      onPress={onPress}
      {...restViewProps}
    >
      <View
        accessible={false}
        style={[style.inner, { borderColor: selected ? colors.azure : style.inner.borderColor }]}
      >
        <Text style={style.title}>{titleWithoutParenthesis}</Text>
        <View style={style.perksWrapper}>
          {perks.map((perk, index) => (
            <View style={style.perkWrapper} key={`perk-${index}`}>
              <Icon
                name="checkmark"
                height={style.perkText.fontSize * 0.8}
                width={style.perkText.fontSize * 0.8}
                fill={iconColor}
              />
              <Text style={style.perkText}>{perk}</Text>
            </View>
          ))}
        </View>
        <View style={style.priceWrapper}>
          {typeof price === 'string' ? (
            <Text style={style.price} accessibilityLabel={`${t('PRODUCT-PRICE-LABEL')}: ${price}`}>
              {price}
            </Text>
          ) : (
            price
          )}
        </View>
        {!screenReaderEnabled && image && (
          <Image
            accessible={false}
            contentFit={orientation === 'horizontal' ? 'contain' : 'cover'}
            style={[
              orientation === 'horizontal' ? style.imageHorizontal : style.imageVertical,
              imageStyle
            ]}
            contentPosition={'right bottom'}
            source={image}
          />
        )}
      </View>
      {tag && (
        <View style={style.tagWrapper} accessible={false}>
          <Text style={style.tag}>{tag}</Text>
        </View>
      )}
    </Wrapper>
  )
}
