import React, { memo } from 'react'
import * as Svg from 'react-native-svg'

type TLineProps = {
  fromCoordinatesX: number
  fromCoordinatesY: number
  toCoordinatesX: number
  toCoordinatesY: number
  shouldHighlight: boolean
}

const Line = ({
  fromCoordinatesX,
  fromCoordinatesY,
  toCoordinatesX,
  toCoordinatesY,
  shouldHighlight
}: TLineProps): JSX.Element => (
  <Svg.Path
    d={`M ${fromCoordinatesX} ${fromCoordinatesY} L ${toCoordinatesX} ${toCoordinatesY}`}
    stroke={shouldHighlight ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.05)'}
    strokeWidth="2"
    fill="none"
  />
)

export default memo(Line)
