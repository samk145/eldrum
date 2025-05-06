import type { EditorArea, EditorLocation } from '@actnone/eldrum-editor/dist/types'
import type { TMapPoint, TMapPointType } from '../../../../../models/movement'
import type Movement from '../../../../../models/movement'

import React, { memo, useMemo, type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { Button } from '../../../../units'
import style from './location-list.style'

type TLocationListProps = {
  points: TMapPoint[]
  playerLocation: EditorLocation
  playerArea: EditorArea
  locked: boolean
  action: (point: TMapPointType, id: string) => void
  getShortestRoute: Movement['getShortestRoute']
}

const LocationList: FC<TLocationListProps> = ({
  points,
  playerLocation,
  playerArea,
  locked,
  action,
  getShortestRoute
}) => {
  const { t } = useTranslation()

  const getPointName = (point: TMapPoint, isCurrentLocation: boolean, isCurrentArea: boolean) => {
    const translationKeyPrefix = point.type === 'location' ? point.type.toUpperCase() : 'AREA'
    const label = t(`${translationKeyPrefix}-${point.id}-NAME`, { ns: 'world' })

    if (point.type === 'sub-area') {
      if (isCurrentArea) {
        return `${label} (${t('MAP-SUB_AREA-LABEL')}, ${t('MAP-POINT-CURRENT-LABEL')})`
      } else if (!point.isKnown) {
        return t('MAP-UNKNOWN_SUB_AREA-LABEL')
      } else {
        return `${label} (${t('MAP-SUB_AREA-LABEL')})`
      }
    } else {
      if (isCurrentLocation) {
        return `${label} (${t('MAP-POINT-CURRENT_LOCATION-LABEL')})`
      } else if (!point.isKnown) {
        return t('MAP-UNKNOWN_LOCATION-LABEL')
      } else {
        return label
      }
    }
  }

  const filteredPoints = useMemo(
    () =>
      points.reduce((points: TMapPoint[], point) => {
        if (point.type !== 'parent-area' && point.isKnown && !points.find(p => p.id === point.id)) {
          points.push(point)
        }

        return points
      }, []),
    [points]
  )

  const sortedOnDistancePoints = useMemo(
    () =>
      filteredPoints.sort((a, b) =>
        getShortestRoute(playerLocation._id, a.id) > getShortestRoute(playerLocation._id, b.id)
          ? 1
          : -1
      ),
    [playerLocation, filteredPoints]
  )

  const renderPoint = (point: TMapPoint) => {
    const isCurrentLocation = playerLocation._id === point.id
    const isCurrentArea = playerArea._id === point.id

    return (
      <Button
        disabled={locked || isCurrentLocation || !point.isKnown}
        wrapperStyle={style.optionWrapper}
        labelStyle={isCurrentLocation || isCurrentArea ? style.currentOptionLabel : {}}
        key={point.id}
        label={getPointName(point, isCurrentLocation, isCurrentArea)}
        onPress={() => action(point.type, point.id)}
      />
    )
  }

  return <View style={style.wrapper}>{sortedOnDistancePoints.map(renderPoint)}</View>
}

export default memo(LocationList)
