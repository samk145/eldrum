import React from 'react'
import { AccessibilityFocus, Text } from '../../../../units'
import style from './area-name.style'
import { useTranslation } from 'react-i18next'

type TAreaNameProps = {
  currentAreaId: string
  shouldFocus: boolean
}

const AreaName = ({ currentAreaId, shouldFocus }: TAreaNameProps): JSX.Element => {
  const { t } = useTranslation()
  const label = t(`AREA-${currentAreaId}-NAME`, { ns: 'world' })

  return (
    <AccessibilityFocus
      id="WorldMapAreaName"
      key={currentAreaId}
      shouldFocus={shouldFocus}
      focusOnMount
      focusOnUpdate={false}
      delay={15}
      accessibilityLabel={`${t('MAP-AREA-LABEL')}: ${label}`}
      style={style.top}
    >
      <Text style={style.areaName}>{label}</Text>
    </AccessibilityFocus>
  )
}

export default React.memo(AreaName)
