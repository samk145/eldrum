import React, { useState } from 'react'
import * as Clipboard from 'expo-clipboard'
import { useStores } from '../../../contexts/stores'
import { type Save as DatabaseSave } from '../../../models/database/schemas/save'
import { AlertCardModal } from '../../units/alert-card-modal/alert-card-modal'
import { LimitReachedAlert } from '../limit-reached-alert/limit-reached-alert'
import { UpgradeAlert } from '../upgrade-alert/upgrade-alert'
import { Text } from '../../units/text/text'
import { AccessType } from '../../../stores/purchase'
import style from './save-contextual-menu.style'
import { useTranslation } from 'react-i18next'

type TSaveContextMenuProps = {
  save: DatabaseSave
  hide: () => void
  visible: boolean
}

const SaveContextualMenu = ({ hide, visible, save }: TSaveContextMenuProps) => {
  const { t } = useTranslation()
  const { ui, saves, purchase, play } = useStores()
  const [limitReachedVisible, setLimitReachedVisible] = useState(false)
  const [upgradeAlertVisible, setUpgradeAlertVisible] = useState(false)
  const hideLimitReached = () => setLimitReachedVisible(false)
  const hideUpgradeAlert = () => setUpgradeAlertVisible(false)

  const handleDelete = async () => {
    await ui.confirm(
      t('LOAD-DELETE_SAVE_CONFIRMATION-TITLE'),
      t('LOAD-DELETE_SAVE_CONFIRMATION-MESSAGE')
    )
    play.deleteSave(save.id)
  }

  const handleBranch = async () => {
    const numberOfPlaythroughs = saves.playthroughs.length

    if (purchase.isConfigured && purchase.access < AccessType.premium) {
      setUpgradeAlertVisible(true)
      return
    }

    if (numberOfPlaythroughs >= purchase.maxPlaythroughs) {
      setLimitReachedVisible(true)
      return
    }

    await play.branchPlaythroughFromSave(save, false)
  }

  const handleCopy = () => {
    const stringifiedSave = JSON.stringify(save, null, 2)

    Clipboard.setString(stringifiedSave)
    hide()
  }

  const buttons = [
    {
      text: t('LOAD-DELETE_SAVE_BUTTON-LABEL'),
      onPress: handleDelete
    },
    {
      text: t('LOAD-BRANCH_PLAYTHROUGH_BUTTON-LABEL'),
      onPress: handleBranch
    },
    {
      text: t('LOAD-COPY_SAVE_CLIPBOARD-LABEL'),
      onPress: handleCopy
    }
  ]

  const date = new Date(save.timeSpent)
  const hoursPlayed = date.getHours() - 1
  const minutesPlayed = date.getMinutes()

  return (
    <AlertCardModal onDismiss={hide} visible={visible} buttons={buttons}>
      {!(limitReachedVisible || upgradeAlertVisible) && (
        <Text style={style.playtime}>
          {t('LOAD-SAVE_PLAYTIME-LABEL', { hoursPlayed, minutesPlayed })}
        </Text>
      )}
      <UpgradeAlert
        type="branch"
        onDismiss={hideUpgradeAlert}
        visible={upgradeAlertVisible}
        onPurchaseFinished={handleBranch}
      />
      <LimitReachedAlert type="branch" onDismiss={hideLimitReached} visible={limitReachedVisible} />
    </AlertCardModal>
  )
}

export default SaveContextualMenu
