import type { TMapPointType } from '../../../../../models/movement'
import React from 'react'
import * as Svg from 'react-native-svg'
import { variables } from '../../../../../styles'

type TAreaProps = {
  coordinatesX: number
  coordinatesY: number
  isPlayerArea: boolean
  type?: TMapPointType
  id: string
  onPressOut: (type?: TMapPointType, id?: string) => void
}

const Area = ({ isPlayerArea, coordinatesX, coordinatesY, id, type, onPressOut }: TAreaProps) => {
  return (
    <Svg.G>
      {isPlayerArea && (
        <Svg.Circle
          r={16}
          cx={coordinatesX}
          cy={coordinatesY}
          fill={variables.colors.azure}
          fillOpacity={0.4}
        />
      )}

      {type === 'sub-area' && (
        <Svg.Circle r={12} cx={coordinatesX} cy={coordinatesY} fill="#FFFFFF" />
      )}

      <Svg.Circle
        onPressOut={() => onPressOut(type, id)}
        r={30}
        cx={coordinatesX}
        cy={coordinatesY}
        fillOpacity="0"
      />
    </Svg.G>
  )
}

export default React.memo(Area)
