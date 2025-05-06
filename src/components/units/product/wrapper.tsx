import { View, TouchableOpacity } from 'react-native'
import type { ViewProps, GestureResponderEvent } from 'react-native'
import React from 'react'

type TWrapperProps = {
  onPress?: (event: GestureResponderEvent) => any
  selected?: boolean
} & ViewProps

const Product = ({ onPress, selected, children, ...restViewProps }: TWrapperProps) => {
  return onPress ? (
    <TouchableOpacity
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      {...restViewProps}
    >
      {children}
    </TouchableOpacity>
  ) : (
    <View {...restViewProps}>{children}</View>
  )
}

export default Product
