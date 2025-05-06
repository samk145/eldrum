import type { TMapPoint, TMapPointType, TCoordinates } from '../../../../../models/movement'
import type { EditorLocation } from '@actnone/eldrum-editor/dist/types'

import React from 'react'
import Location from './location'

type TLocationsProps = {
  playerLocation: EditorLocation
  locations: TMapPoint[]
  selectedPointId: string | null
  onPressOut: (type?: TMapPointType, id?: string) => void
  buffer: (coordinates: TCoordinates) => TCoordinates
}

function locationsPropsAreEqual(prevProps: TLocationsProps, nextProps: TLocationsProps) {
  if (nextProps.selectedPointId !== prevProps.selectedPointId) {
    return false
  }
  const newOrChangedLocation = nextProps.locations.find(
    (location, index) =>
      !prevProps.locations[index] ||
      location.id !== prevProps.locations[index].id ||
      location.isKnown !== prevProps.locations[index].isKnown
  )
  if (newOrChangedLocation) {
    return false
  }
  return true
}

const Locations = ({
  playerLocation,
  locations,
  selectedPointId,
  onPressOut,
  buffer
}: TLocationsProps): JSX.Element => {
  const locationsToRender = locations.filter(({ id, isKnown, type }) =>
    type === 'location' ? playerLocation._id === id || isKnown : false
  )

  return (
    <>
      {locationsToRender.map(point => {
        const { id, type } = point
        const locationRadius = type === 'location' ? 7 : 11
        const selected = id === selectedPointId
        const coordinates = buffer(point.coordinates)

        return (
          <Location
            key={id}
            coordinatesX={coordinates.x}
            coordinatesY={coordinates.y}
            {...{
              locationRadius,
              type,
              selected,
              id,
              onPressOut
            }}
          />
        )
      })}
    </>
  )
}

export default React.memo(Locations, locationsPropsAreEqual)
