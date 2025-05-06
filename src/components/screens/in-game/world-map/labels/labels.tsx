import type { TMapMode } from '../../../../../models/puppeteer'
import type { TMapPoint, TCoordinates } from '../../../../../models/movement'
import type { EditorLocation } from '@actnone/eldrum-editor/dist/types'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Label } from './label'

type TLabelsProps = {
  points: TMapPoint[]
  mode: TMapMode
  playerLocation: EditorLocation
  buffer: (coordinates: TCoordinates) => TCoordinates
}

const Labels = ({ points, mode, playerLocation, buffer }: TLabelsProps) => {
  const { t } = useTranslation()

  return points
    .filter(point => {
      const { id, isKnown, type } = point

      if (mode !== 'maximized') {
        return false
      }

      let hidden = !isKnown

      if (type === 'sub-area' && playerLocation.area === id) {
        hidden = false
      } else if (type === 'location' && playerLocation._id === id) {
        hidden = false
      }

      if (hidden) {
        return false
      }

      return true
    })
    .map((point, index) => {
      const { id, type } = point
      const coordinates = buffer(point.coordinates)
      const translationKeyPrefix = point.type === 'location' ? point.type.toUpperCase() : 'AREA'
      const label = t(`${translationKeyPrefix}-${point.id}-NAME`, { ns: 'world' })

      return (
        <Label
          key={`${id}-${index}`}
          type={type}
          label={label}
          x={coordinates.x}
          y={coordinates.y}
        />
      )
    })
}

export default Labels
