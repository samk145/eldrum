import type { ICarouselInstance } from 'react-native-reanimated-carousel'

import React, { type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type StyleProp,
  TouchableOpacity,
  type ViewStyle,
  type TouchableOpacityProps
} from 'react-native'
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from 'react-native-reanimated'
import { Rect } from '../../../../helpers/misc'
import style from './pagination-item.style'

type TPaginationItemProps = {
  animValue: Animated.SharedValue<number>
  backgroundColor: string
  carouselRef: RefObject<ICarouselInstance>
  currentIndex: number
  index: number
  length: number
  wrapperStyles?: StyleProp<ViewStyle>
} & TouchableOpacityProps

const PaginationItem = ({
  animValue,
  backgroundColor,
  carouselRef,
  index,
  currentIndex,
  length,
  wrapperStyles,
  ...rest
}: TPaginationItemProps) => {
  const { t } = useTranslation()
  const width = 10
  const animStyle = useAnimatedStyle(() => {
    let inputRange = [index - 1, index, index + 1]
    let outputRange = [-width, 0, width]

    if (index === 0 && animValue.value > length - 1) {
      inputRange = [length - 1, length, length + 1]
      outputRange = [-width, 0, width]
    }

    return {
      transform: [
        {
          translateX: interpolate(animValue?.value, inputRange, outputRange, Extrapolate.CLAMP)
        }
      ]
    }
  }, [animValue, index, length])

  const onPaginationPress = () => {
    if (!carouselRef.current) return

    carouselRef.current.scrollTo({ index, animated: true })
  }

  const isCurrent = index === currentIndex

  return (
    <TouchableOpacity
      hitSlop={Rect(5, 5, 5, 5)}
      disabled={isCurrent}
      onPress={onPaginationPress}
      accessibilityLabel={`${t('PAGINATION-PAGE_NUMBER-LABEL', { pageNumber: index + 1 })} ${isCurrent ? `(${t('CURRENT_LABEL')})` : ''}`}
      style={[
        style.wrapper,
        wrapperStyles,
        {
          width,
          height: width
        }
      ]}
      {...rest}
    >
      <Animated.View
        style={[
          {
            borderRadius: 50,
            backgroundColor,
            flex: 1
          },
          animStyle
        ]}
      />
    </TouchableOpacity>
  )
}

export default PaginationItem
