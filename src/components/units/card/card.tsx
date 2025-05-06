import type {
  ViewProps,
  LayoutChangeEvent,
  LayoutRectangle,
  ViewStyle,
  StyleProp
} from 'react-native'
import React, { type ReactNode, useCallback, useState } from 'react'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import { variables } from '../../../styles'
import { CardBackground, type TCardCorners } from './card-background/card-background'
import styles from './card.style'

const { colors } = variables

const DEFAULT_CARD_OPACITY = 1
const DEFAULT_ANIMATION_DURATION = 0

const getCornerRadius = (corners: TCardCorners, cornerSize: number): ViewStyle => {
  const style: ViewStyle = {}

  switch (corners) {
    case 'top':
      style.borderTopStartRadius = cornerSize
      style.borderTopEndRadius = cornerSize
      style.borderTopLeftRadius = cornerSize
      style.borderTopRightRadius = cornerSize
      break
    case 'bottom':
      style.borderBottomStartRadius = cornerSize
      style.borderBottomEndRadius = cornerSize
      style.borderBottomLeftRadius = cornerSize
      style.borderBottomRightRadius = cornerSize
      break
    default:
      style.borderRadius = cornerSize
      break
  }

  return style
}

export type TCardProps = {
  style?: StyleProp<ViewStyle>
  children?: ReactNode | ReactNode[]
  tint?: string
  cardOpacity?: number
  cornerSize?: number | undefined
  corners?: TCardCorners
  onLoadAnimationDuration?: number
} & ViewProps

export const Card = ({
  style = {},
  children,
  tint = colors.night,
  cornerSize = 50,
  corners = 'top',
  cardOpacity = 1,
  onLoadAnimationDuration = DEFAULT_ANIMATION_DURATION,
  ...rest
}: TCardProps) => {
  const [outerDimensions, setOuterDimensions] = useState<LayoutRectangle>()
  const onLayout = (event: LayoutChangeEvent) => setOuterDimensions(event.nativeEvent.layout)
  const animatedOpacity = useSharedValue(0)
  const animatedStyle = useAnimatedStyle(() => ({ opacity: animatedOpacity.value }))
  const handleLoad = useCallback(() => {
    if (animatedOpacity.value !== DEFAULT_CARD_OPACITY) {
      fade(onLoadAnimationDuration, DEFAULT_CARD_OPACITY)
    }
  }, [])

  function fade(duration: number, toValue: number) {
    if (duration > 0) {
      animatedOpacity.value = withTiming(toValue, {
        duration,
        easing: Easing.inOut(Easing.ease)
      })
    } else {
      animatedOpacity.value = toValue
    }
  }

  const wrapperStyles = [
    styles.wrapper,
    (cornerSize && getCornerRadius(corners, cornerSize)) || undefined,
    style,
    animatedStyle
  ]

  return (
    <Animated.View onLayout={onLayout} style={wrapperStyles} {...rest}>
      {children}

      {outerDimensions && (
        <CardBackground
          width={outerDimensions?.width}
          height={outerDimensions?.height}
          corners={corners}
          tint={tint}
          cornerSize={cornerSize}
          onLoad={handleLoad}
          opacity={cardOpacity}
        />
      )}
    </Animated.View>
  )
}
