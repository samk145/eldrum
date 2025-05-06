import type { EditorLocation } from '@actnone/eldrum-editor/dist/types'
import type { TMapPointType, TMapPoint, TCoordinates } from '../../../../../models/movement'
import React from 'react'
import Area from './area'

type TAreasProps = {
  areas: TMapPoint[]
  buffer: (coordinates: TCoordinates) => TCoordinates
  onPressOut: (type?: TMapPointType, id?: string) => void
  playerLocation: EditorLocation
}

function areasPropsAreEqual(prevProps: TAreasProps, nextProps: TAreasProps) {
  if (nextProps.playerLocation.area !== prevProps.playerLocation.area) {
    return false
  }

  const newOrChangedArea = nextProps.areas.find(
    (area, index) =>
      !prevProps.areas[index] ||
      area.id !== prevProps.areas[index].id ||
      area.isKnown !== prevProps.areas[index].isKnown
  )
  if (newOrChangedArea) {
    return false
  }

  return true
}

function Areas({ areas, buffer, onPressOut, playerLocation }: TAreasProps): JSX.Element {
  const areasToRender = areas.filter(({ id, isKnown, type }) =>
    ['sub-area', 'parent-area'].includes(type) ? playerLocation._id === id || isKnown : false
  )

  return (
    <>
      {areasToRender.map((point, index) => {
        const { id, type } = point
        const coordinates = buffer(point.coordinates)
        const isPlayerArea = playerLocation.area === id

        return (
          <Area
            key={`${id}-${index}`}
            coordinatesX={coordinates.x}
            coordinatesY={coordinates.y}
            {...{ isPlayerArea, type, id, onPressOut }}
          />
        )
      })}
    </>
  )
}

export default React.memo(Areas, areasPropsAreEqual)
