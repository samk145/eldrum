import React from 'react'
import { type GestureResponderEvent, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Icon, Button } from '../../../../units'
import { style, reCenterButtonIconSize } from './map-bottom-bar.styles'

type TMapBottomBarProps = {
  reCenterPlayer: (event?: GestureResponderEvent) => void
  currentAreaParent?: string
  knownLocationsInParentArea?: number
  mapDataLength?: number
  handleZoomOut: () => void
  handleMinimize: (event?: GestureResponderEvent) => void
}

const MapBottomBar = ({
  reCenterPlayer,
  currentAreaParent,
  knownLocationsInParentArea,
  handleMinimize,
  handleZoomOut,
  mapDataLength
}: TMapBottomBarProps) => {
  const { t } = useTranslation()

  return (
    <View style={style.bottom}>
      <View style={style.buttons}>
        <View style={style.buttonWrapper}>
          <TouchableOpacity
            accessibilityLabel={t('MAP-ZOOM_RESET-BUTTON-LABEL')}
            touchSoundDisabled={true}
            onPress={reCenterPlayer}
            style={style.reCenterButton}
          >
            <Icon
              name="centerMap"
              height={reCenterButtonIconSize}
              width={reCenterButtonIconSize}
              fill="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        <View style={style.buttonWrapper}>
          <Button
            label={t('MAP-ZOOM_OUT-BUTTON-LABEL')}
            disabled={
              !(currentAreaParent && Number(mapDataLength) > 1) || !knownLocationsInParentArea
            }
            onPress={handleZoomOut}
          />
        </View>

        <View style={style.buttonWrapper}>
          <Button label={t('MAP-CLOSE-BUTTON-LABEL')} onPress={handleMinimize} />
        </View>
      </View>
    </View>
  )
}

export default React.memo(MapBottomBar)
