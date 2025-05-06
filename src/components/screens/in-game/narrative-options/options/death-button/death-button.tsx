import { type Save } from '../../../../../../models/database/schemas/save'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text as NativeText } from 'react-native'
import { observer } from 'mobx-react'
import { useGameStore, useStores } from '../../../../../../contexts/stores'
import { Button, CardModal, Text } from '../../../../../units'
import { Playthrough } from '../../../../../structures'
import { camelCaseToConstCase, formatTimestamp } from '../../../../../../helpers/misc'
import { dimensions } from '../../../../../../styles'
import style from './death-button.style'

const DeathButton = () => {
  const { t, i18n } = useTranslation()

  const { saves, play } = useStores()
  const game = useGameStore()
  const currentPlaythrough =
    saves.playthroughs
      .find(playthrough =>
        playthrough.find(save => save.saveData && save.saveData._id === game?._id)
      )
      ?.slice(1) || []
  const latestSave = saves.getLatestSave(game?._id, true)
  const [showSaves, setShowSaves] = useState(false)
  const showModal = () => setShowSaves(true)
  const hideModal = () => setShowSaves(false)
  const loadLatestSave = () => play.loadFromLatestSave(game?._id, true)

  const formatSaveData = (save: Save) => {
    const { timestamp } = save

    return (
      <NativeText style={style.saveDataDescription}>
        <NativeText>{t('DEATH-LATEST_SAVE-BUTTON-LABEL')}: </NativeText>
        <NativeText style={style.slotName}>
          {`${t(`SAVE-TYPE-${camelCaseToConstCase(save.type)}-LABEL`)} ${t('SAVE-LABEL')}, `}
        </NativeText>
        <NativeText>{formatTimestamp(timestamp, i18n.language)}</NativeText>
      </NativeText>
    )
  }

  return (
    <>
      <Button
        wrapperStyle={style.optionWrapper}
        label={t('DEATH-TRY_AGAIN-BUTTON-LABEL')}
        onPress={loadLatestSave}
      />
      {latestSave && formatSaveData(latestSave)}

      {currentPlaythrough.length > 0 && (
        <React.Fragment>
          <Text style={style.deathButtonOrText}>{t('DEATH-ALTERNATIVE_OPTION-LABEL')}</Text>
          <Button size="mini" label={t('DEATH-REWIND-BUTTON-LABEL')} onPress={showModal} />
        </React.Fragment>
      )}

      <CardModal
        visible={showSaves}
        height={dimensions.height * 0.75}
        onHandleDragSuccess={hideModal}
        onOverlayPress={hideModal}
        useOverlay
      >
        <View style={style.playthroughsWrapper}>
          <Playthrough
            playthrough={currentPlaythrough}
            hideTitle
            hideMostRecent
            deleteButton={false}
          />
        </View>
      </CardModal>
    </>
  )
}

export default observer(DeathButton)
