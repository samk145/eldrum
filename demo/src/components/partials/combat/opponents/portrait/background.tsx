import React from 'react'
import { Group, interpolate, LinearGradient, RoundedRect, vec } from '@shopify/react-native-skia'
import { observer } from 'mobx-react'
import { helpers, variables } from '@actnone/eldrum-engine/styles'
import { type SharedValue, useDerivedValue } from 'react-native-reanimated'

const { distance, colors } = variables

const INACTIVE = 0
const ACTIVE = 1
const DEFAULT_COLOR = helpers.hexToRgbA(colors.nightShade, 0.4)
const VANISHING_POINT = 500
const CARD_ROTATION = 0.5

type TPortraitProps = {
  containerDimensions: { width: number; height: number }
  canvasDimensions: { width: number; height: number }
  activeValue: SharedValue<number>
}

export const Background = observer(function Background({
  containerDimensions,
  canvasDimensions,
  activeValue
}: TPortraitProps) {
  const position = { x: containerDimensions.width, y: canvasDimensions.height / 4 }
  const gradientX = position.x + containerDimensions.width / 2

  const cardGroupTransform = useDerivedValue(() => {
    // Note: The before and after translateY is what anchors the animation at the bottom
    // see https://stackoverflow.com/a/73413335/930998
    const height = containerDimensions.height / 2

    return [
      {
        translateY: interpolate(activeValue.value, [INACTIVE, ACTIVE], [0, height])
      },
      { perspective: VANISHING_POINT },
      { rotateX: interpolate(activeValue.value, [INACTIVE, ACTIVE], [0, CARD_ROTATION]) },
      {
        translateY: interpolate(activeValue.value, [INACTIVE, ACTIVE], [0, -height])
      }
    ]
  }, [])

  return (
    <Group
      transform={cardGroupTransform}
      origin={{
        x: position.x + containerDimensions.width / 2,
        y: position.y + containerDimensions.height / 2
      }}
    >
      <RoundedRect
        x={position.x}
        y={position.y}
        width={containerDimensions.width}
        height={containerDimensions.height}
        r={helpers.getSizeValue(distance, distance, distance / 2)}
      >
        <LinearGradient
          start={vec(gradientX, 100)}
          end={vec(gradientX, containerDimensions.height)}
          colors={[helpers.hexToRgbA(colors.nightShade, 0), DEFAULT_COLOR]}
        />
      </RoundedRect>
    </Group>
  )
})
