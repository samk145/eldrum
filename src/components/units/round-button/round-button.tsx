import React, { useMemo, useRef } from 'react'
import {
  type StyleProp,
  type TextStyle,
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
  type ViewStyle
} from 'react-native'
import { Circle } from '../../../assets/graphics/png-parts'
import { Rect } from '../../../helpers/misc'
import { Text } from '../text/text'
import { type TSizePerDimension, type TUISize, variables } from '../../../styles'
import style, { calculatePngSize, getSizeStyles } from './round-button.style'

type TRoundButtonProps = TouchableOpacityProps & {
  disabled?: boolean
  color?: string | undefined
  label?: string | React.ReactNode
  labelStyles?: TextStyle
  size?: TUISize
  customSize?: TSizePerDimension
  wrapperStyle?: StyleProp<ViewStyle>
  borderWidth?: number
  borderColor?: string
  icon?:
    | React.ReactNode
    | ((props: { height: number; width: number; fill: string; viewBox: string }) => React.ReactNode)
  iconWrapperStyle?: ViewStyle
}

const defaultHitSlop = Rect(5, 5, 5, 5)

export const RoundButton = React.forwardRef(function RoundButton(
  {
    color = '#000',
    label,
    labelStyles,
    size = 'mini',
    disabled = false,
    customSize,
    children,
    wrapperStyle,
    borderWidth,
    borderColor,
    icon,
    iconWrapperStyle,
    hitSlop = defaultHitSlop,
    ...rest
  }: TRoundButtonProps,
  ref?: React.Ref<TouchableOpacity>
) {
  if (icon && label) {
    throw new Error('RoundButton component cannot have label and icon at the same time.')
  }
  const sizeStyle = useMemo(
    () =>
      getSizeStyles({
        size,
        customSize,
        borderWidth: borderColor && borderWidth ? borderWidth : 0
      }),
    [size, customSize, borderColor, borderWidth]
  )

  const randomNumber = useRef(Math.random()).current

  const finalWrapperStyle = [
    style.wrapper,
    sizeStyle.wrapper,
    borderWidth && borderColor ? { borderWidth, borderColor } : undefined,
    disabled ? sizeStyle.wrapperDisabled : undefined
  ]
  const finalBackgroundStyle = useMemo(
    () => [
      style.wrapper,
      sizeStyle.background,
      style.circleBackground,
      { transform: [{ rotate: `${360 * randomNumber}deg` }] }
    ],
    [sizeStyle]
  )

  const pngSize = customSize ? calculatePngSize(customSize) : size
  const finalIconProps = {
    width: sizeStyle.icon.width,
    height: sizeStyle.icon.height,
    fill: sizeStyle.icon.color,
    viewBox: '0 0 200 200'
  }

  const _icon = useMemo(() => {
    return typeof icon === 'function' ? icon(finalIconProps) : icon
  }, [icon])

  const finalLabelStyle: StyleProp<TextStyle> = [
    style.label,
    { marginTop: icon ? variables.distance / 12 : 0 },
    labelStyles
  ]

  return (
    <TouchableOpacity
      accessible
      accessibilityLabel={typeof label === 'string' ? label : undefined}
      accessibilityState={{ disabled }}
      accessibilityRole="button"
      disabled={disabled}
      ref={ref}
      touchSoundDisabled={true}
      hitSlop={hitSlop}
      {...rest}
    >
      <View style={finalWrapperStyle}>
        {icon && (
          <View key="icon-wrapper" style={[style.wrapper, sizeStyle.wrapper]}>
            {_icon}
          </View>
        )}
        {children}
        {typeof label === 'string' ? <Text style={finalLabelStyle}>{label}</Text> : label}

        <Circle size={pngSize} tint={color} style={finalBackgroundStyle} />
      </View>
    </TouchableOpacity>
  )
})
