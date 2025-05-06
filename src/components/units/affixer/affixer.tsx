import type { ReactNode } from 'react'
import React from 'react'
import {
  View,
  type ViewStyle,
  type TextStyle,
  type StyleProp,
  type ViewProps,
  type TextProps
} from 'react-native'
import { Text } from '../text/text'
import getSizeStyle from './affixer.style'

type TAffixerProps = {
  prefix?: ReactNode
  suffix?: ReactNode
  component: ReactNode
  size: 'mini' | 'small' | 'regular'
  wrapperStyle?: StyleProp<ViewStyle>
  labelStyle?: StyleProp<TextStyle>
  fixProps?: TextProps
} & ViewProps

export const Affixer = ({
  prefix,
  suffix,
  component,
  size,
  wrapperStyle,
  labelStyle,
  fixProps,
  ...rest
}: TAffixerProps) => {
  const style = getSizeStyle(size)

  return (
    <View style={[style.wrapper, wrapperStyle]} {...rest}>
      {prefix && (
        <Text style={[style.affix, style.prefix, labelStyle]} {...fixProps}>
          {prefix}
        </Text>
      )}
      {component}
      {suffix && (
        <Text style={[style.affix, style.suffix, labelStyle]} {...fixProps}>
          {suffix}
        </Text>
      )}
    </View>
  )
}
