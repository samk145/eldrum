import type { TMapLine, TCoordinates } from '../../../../../models/movement'

import React from 'react'
import Line from './line'

type TLinesProps = {
  lines: TMapLine[]
  route: string[]
  buffer: (coordinates: TCoordinates) => TCoordinates
}

const Lines = ({ lines, route, buffer }: TLinesProps): JSX.Element => {
  return (
    <>
      {lines.map(line => {
        const fromCoordinates = buffer(line.from.coordinates)
        const toCoordinates = buffer(line.to.coordinates)
        const shouldHighlight = route.includes(line.id)

        return (
          <Line
            key={line.id}
            shouldHighlight={shouldHighlight}
            fromCoordinatesX={fromCoordinates.x}
            fromCoordinatesY={fromCoordinates.y}
            toCoordinatesX={toCoordinates.x}
            toCoordinatesY={toCoordinates.y}
          />
        )
      })}
    </>
  )
}

export default Lines
