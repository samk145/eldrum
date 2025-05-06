import React, { memo } from 'react'
import { TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useStores } from '../../../contexts/stores'
import { type Save as DatabaseSave } from '../../../models/database/schemas/save'
import { formatTimestamp, truncate } from '../../../helpers/misc'
import { Text } from '../../units/text/text'
import { Tag } from '../../units/tag/tag'
import { MediaImage } from '../../units/media/image'
import style from './save.style'

type TSaveProps = {
  save: DatabaseSave
  selected: boolean
  onPress: (save: DatabaseSave) => void
  onLongPress?: (save: DatabaseSave) => void
  disabled?: boolean
  isMostRecent?: boolean
  wrapperStyle?: StyleProp<ViewStyle>
}

const Save = ({ save, selected, onPress, onLongPress, isMostRecent = false }: TSaveProps) => {
  const { t, i18n } = useTranslation()
  const { content } = useStores()
  const type = save.type
  const gameData = save.saveData
  const narrativeText = gameData?.scene.history[
    gameData?.scene.history.length - 1
  ]?.narrativeTranslationKeys
    .map(key => t(key, { ns: 'scenes' }))
    .join()
  const date = save.timestamp ? formatTimestamp(save.timestamp, i18n.language) : ''
  const level = gameData?.character.level || 1
  const location = gameData?.movement.locationId
    ? content.getEntity('locations', gameData.movement.locationId)
    : undefined
  const locationName = location ? t(`LOCATION-${location?._id}-NAME`, { ns: 'world' }) : ''
  const isInEncounter = !!(gameData?.scene.stateEncounter || gameData?.movement.pathEncounterId)
  const levelSuffix = isInEncounter ? '' : ` • ${truncate(locationName, 15)}`
  const disabled = !gameData
  const wrapperStyles = [
    style.wrapper,
    selected && style.wrapperSelected,
    disabled && style.wrapperDisabled
  ]
  const handlePressIn = () => onPress(save)
  const handleLongPress = () => onLongPress && onLongPress(save)

  let accessibilityLabel = t('SAVE-LABEL')

  if (isMostRecent) {
    accessibilityLabel += ` (${t('SAVE-MOST_RECENT-LABEL')})`
  }

  if (selected) {
    accessibilityLabel += `, ${t('SELECTED_LABEL')}\n`
  }

  accessibilityLabel += t('SAVE-A11Y_LABEL', {
    type,
    level,
    locationName,
    date,
    narrativeText
  })

  return (
    <TouchableOpacity
      accessible
      accessibilityLabel={accessibilityLabel}
      touchSoundDisabled={true}
      disabled={disabled}
      style={wrapperStyles}
      onPress={handlePressIn}
      onLongPress={handleLongPress}
    >
      {save.backgroundImage && (
        <View style={style.imageWrapper}>
          <MediaImage style={style.image} media={save.backgroundImage} contentFit="cover" />
        </View>
      )}

      <View style={[style.tagsWrapper]}>
        {isMostRecent && <Tag label={t('SAVE-MOST_RECENT-LABEL')} />}
        <Tag label={t(`SAVE-TYPE-${type.toUpperCase()}-LABEL`)} />
      </View>

      <Text style={[style.label, style.headline]}>
        {level ? `${t('CHARACTER-LEVEL')} ${level}${levelSuffix}` : ' '}
      </Text>

      <Text style={[style.label, style.narrative]}>
        {narrativeText ? truncate(narrativeText, 125) : narrativeText}
      </Text>

      <Text style={[style.label, style.slotDate]}>{date}</Text>
    </TouchableOpacity>
  )
}

export default memo(Save)
