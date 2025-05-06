import type { ViewStyle, TextStyle } from 'react-native'

import React from 'react'
import { View } from 'react-native'
import { variables, helpers } from '../../../styles'
import { type Rect } from '../../../helpers/misc'
import { Text } from '../text/text'
import style from './highlighter.style'

type TPosition = 'top-left' | 'top-center' | 'top-right'

type THighlighterProps = {
  type?: 'label' | 'circle'
  label?: string
  highlight: boolean
  color?: string
  size?: number
  position: TPosition
  customOffset?: ReturnType<typeof Rect>
  children: React.ReactNode
  wrapperStyle?: ViewStyle
}

const getPositionStyle = (position: TPosition, size: number) => {
  const offset = -(size / 4)

  const style: ViewStyle = {
    position: 'absolute',
    top: offset
  }

  switch (position) {
    case 'top-left':
      style.left = offset
      break
    case 'top-right':
      style.right = offset
  }

  return style
}

export const Highlighter = ({
  type = 'circle',
  label,
  highlight,
  color = variables.colors.azure,
  size = variables.distance / 2,
  position,
  customOffset,
  children,
  wrapperStyle
}: THighlighterProps) => {
  const markStyles: ViewStyle[] | TextStyle[] = [
    type === 'circle'
      ? { ...style.circle, backgroundColor: color, width: size, height: size }
      : { ...style.text, color, ...helpers.FontSizeAndLineHeight(size) },
    {
      ...getPositionStyle(position, size),
      ...customOffset
    }
  ]

  if (!highlight) {
    return <>{children}</>
  }

  return (
    <View style={[style.wrapper, wrapperStyle]}>
      {children}
      <View style={style.markWrapper}>
        {type === 'circle' ? <View style={markStyles} /> : <Text style={markStyles}>{label}</Text>}
      </View>
    </View>
  )
}
