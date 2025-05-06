import React, { memo } from 'react'
import { View, type ViewProps } from 'react-native'
import Animated, { LinearTransition, PinwheelIn, ZoomOut } from 'react-native-reanimated'
import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../styles'

const { colors } = variables

const ANIMATION_DURATION = 250

type TAlignment = 'left' | 'center' | 'right'

const getWrapperStyle = (diameter: number, alignment: TAlignment) => {
  if (alignment === 'center') {
    return {
      marginRight: diameter / 3,
      marginLeft: diameter / 3
    }
  } else if (alignment === 'left') {
    return {
      marginRight: diameter / 2
    }
  } else if (alignment === 'right') {
    return {
      marginLeft: diameter / 2
    }
  }
}

interface IActionPointProps {
  diameter: number
  filled: boolean
}

export const ActionPoint: React.FC<IActionPointProps> = ({ diameter, filled }) => {
  const baseStyle = { borderRadius: diameter / 5, height: diameter, width: diameter }

  return <View style={[baseStyle, style.circle, filled && style.circleFilled]} />
}

type TActionPointsProps = {
  current: number
  max: number
  align?: TAlignment
  dotDiameter?: number
} & ViewProps

export const ActionPoints = memo(function ActionPoints({
  current,
  max,
  align = 'left',
  dotDiameter = variables.distance,
  ...rest
}: TActionPointsProps) {
  const circleWrapperStyle = getWrapperStyle(dotDiameter, align)

  const circles = new Array(max).fill('').map((action, i) => (
    <Animated.View
      entering={PinwheelIn.duration(ANIMATION_DURATION)}
      exiting={ZoomOut.duration(ANIMATION_DURATION)}
      style={circleWrapperStyle}
      key={i}
    >
      <ActionPoint filled={i < current} diameter={dotDiameter} />
    </Animated.View>
  ))

  return (
    <Animated.View
      layout={LinearTransition.duration(ANIMATION_DURATION)}
      style={style.wrapper}
      {...rest}
    >
      {circles}
    </Animated.View>
  )
})

const style = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    zIndex: 1
  },
  circle: {
    transform: [{ rotate: '45deg' }],
    backgroundColor: helpers.hexToRgbA('#787878', 0.75)
  },
  circleFilled: {
    backgroundColor: colors.azure
  }
})
