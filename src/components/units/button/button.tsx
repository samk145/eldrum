import type {
  StyleProp,
  ViewStyle,
  TextStyle,
  LayoutChangeEvent,
  TouchableOpacityProps,
  PressableProps,
  GestureResponderEvent,
  ColorValue,
  LayoutRectangle
} from 'react-native'
import React, { useState, useRef, useEffect, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing
} from 'react-native-reanimated'
import { Icon, type TIconProps } from '../icon/icon'
import { Text } from '../text/text'
import style from './button.style'
import ButtonBackground from './button-background/button-background'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const LONGPRESS_DELAY = 250
const ONPRESS_ANIMATION_DURATION = 100
const DISABLED_ANIMATION_DURATION = 0
const DEFAULT_ONLOAD_ANIMATION_DURATION = 0
const DEFAULT_OPACITY = 1
const ONPRESS_OPACITY = 0.3
const DISABLED_OPACITY = ONPRESS_OPACITY

type TButtonProps = TouchableOpacityProps & {
  label?: string
  size?: 'small' | 'mini' | 'regular'
  align?: 'right' | 'left'
  disabled?: boolean
  used?: boolean
  wrapperStyle?: StyleProp<ViewStyle>
  labelStyle?: StyleProp<TextStyle>
  icon?: string
  iconProps?: Omit<TIconProps, 'name'>
  tint?: ColorValue
  onLoadAnimationDuration?: number
} & PressableProps

export const Button = memo(function Button({
  label,
  size = 'regular',
  align,
  disabled = false,
  used,
  wrapperStyle = {},
  labelStyle = {},
  icon,
  iconProps = {
    width: style.icon.width,
    height: style.icon.height
  },
  hitSlop,
  tint,
  onLoadAnimationDuration = DEFAULT_ONLOAD_ANIMATION_DURATION,
  onPressIn,
  onPressOut,
  ...rest
}: TButtonProps) {
  const { t } = useTranslation()
  const withLabel = label !== undefined
  const [outerDimensions, setOuterDimensions] = useState<LayoutRectangle>()
  const onLayout = (event: LayoutChangeEvent) => {
    if (
      !outerDimensions ||
      outerDimensions.width !== event.nativeEvent.layout.width ||
      outerDimensions.height !== event.nativeEvent.layout.height
    ) {
      setOuterDimensions(event.nativeEvent.layout)
    }
  }
  const sideWidth = outerDimensions ? outerDimensions?.height * 1 : 0 // N is the ratio between the width and height of the side image
  const animatedOpacity = useSharedValue<number>(1)
  const animatedStyles = useAnimatedStyle(() => ({ opacity: animatedOpacity.value }))
  const disabledValue = useRef(disabled)

  const fade = (toValue: number, duration: number) => {
    if (duration > 0) {
      animatedOpacity.value = withTiming(toValue, {
        duration,
        easing: Easing.inOut(Easing.ease)
      })
    } else {
      animatedOpacity.value = toValue
    }
  }

  useEffect(() => {
    disabledValue.current = disabled

    if (disabled) {
      fade(DISABLED_OPACITY, DISABLED_ANIMATION_DURATION)
    } else if (!disabled) {
      fade(DEFAULT_OPACITY, DISABLED_ANIMATION_DURATION)
    }
  }, [disabled])

  const onPressInWrapper = (event: GestureResponderEvent) => {
    fade(ONPRESS_OPACITY, ONPRESS_ANIMATION_DURATION)

    if (onPressIn) {
      onPressIn(event)
    }
  }

  const onPressOutWrapper = (event: GestureResponderEvent) => {
    fade(disabledValue.current ? DISABLED_OPACITY : DEFAULT_OPACITY, ONPRESS_ANIMATION_DURATION)

    if (onPressOut) {
      onPressOut(event)
    }
  }

  const wrapperStyles = [
    style.outerWrapper,
    { minWidth: sideWidth * 2 },
    wrapperStyle,
    disabled && style.wrapperDisabled,
    !withLabel && icon ? style.wrapperIconOnly : undefined
  ]

  const labelStyles = [
    style.label,
    labelStyle,
    disabled && style.labelDisabled,
    used && style.labelUsed
  ]

  switch (align) {
    case 'right':
      wrapperStyles.push(style.wrapperRight)
      break
    case 'left':
      wrapperStyles.push(style.wrapperLeft)
      break
    default:
      break
  }

  let contentWrapperStyle = style.wrapper

  if (size === 'small') {
    labelStyles.push(style.labelSmall)
    iconProps.width = style.iconSmall.width
    iconProps.height = style.iconSmall.height
    contentWrapperStyle = style.wrapperSmall

    if (!withLabel && icon) {
      wrapperStyles.push(style.wrapperSmallIconOnly)
    }
  }

  if (size === 'mini') {
    labelStyles.push(style.labelMini)
    iconProps.width = style.iconMini.width
    iconProps.height = style.iconMini.height
    contentWrapperStyle = style.wrapperMini

    if (!withLabel && icon) {
      wrapperStyles.push(style.wrapperMiniIconOnly)
    }
  }

  return (
    <AnimatedPressable
      style={[wrapperStyles, animatedStyles]}
      onPressIn={onPressInWrapper}
      onPressOut={onPressOutWrapper}
      accessible
      accessibilityLabel={used ? `${label} (${t('BUTTON-USED-LABEL')})` : label}
      accessibilityState={{ disabled }}
      accessibilityRole="button"
      touchSoundDisabled={true}
      disabled={disabled}
      delayLongPress={LONGPRESS_DELAY}
      delayPressIn={0}
      onLayout={onLayout}
      {...rest}
    >
      <View style={contentWrapperStyle}>
        {withLabel && <Text style={labelStyles}>{label}</Text>}

        {icon && (
          <View style={[style.iconWrapper, !withLabel && style.iconWrapperIconOnly]}>
            <Icon {...iconProps} name={icon} />
          </View>
        )}
      </View>
      {outerDimensions && (
        <ButtonBackground
          height={outerDimensions.height}
          width={outerDimensions.width}
          sideWidth={sideWidth}
          tint={tint as string}
        />
      )}
    </AnimatedPressable>
  )
})
