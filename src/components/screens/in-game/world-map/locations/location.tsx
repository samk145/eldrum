import type { TMapPointType } from '../../../../../models/movement'

import React from 'react'
import * as Svg from 'react-native-svg'
import { useTranslation } from 'react-i18next'

type TLocationProps = {
  locationRadius: number
  coordinatesX: number
  coordinatesY: number
  selected: boolean
  type?: TMapPointType
  id: string
  onPressOut: (type?: TMapPointType, id?: string) => void
}

const Location = ({
  coordinatesX,
  coordinatesY,
  id,
  locationRadius,
  selected,
  type,
  onPressOut
}: TLocationProps) => {
  const { t } = useTranslation()

  return (
    <Svg.G>
      <Svg.Circle
        r={locationRadius}
        cx={coordinatesX}
        cy={coordinatesY}
        fill="#FFFFFF"
        stroke="#fff"
        strokeOpacity={0.3}
        strokeWidth={selected ? 15 : 0}
      />

      <Svg.Circle
        onPressOut={() => onPressOut(type, id)}
        r={30}
        cx={coordinatesX}
        cy={coordinatesY}
        fillOpacity="0"
      />

      {selected && (
        <Svg.Text
          x={coordinatesX}
          y={coordinatesY + 35}
          textAnchor="middle"
          fill="white"
          fontFamily="serif-regular"
          fontSize={12}
        >
          {t('MAP-TRAVEL_CONFIRM-BUTTON-LABEL')}
        </Svg.Text>
      )}
    </Svg.G>
  )
}

export default React.memo(Location)
