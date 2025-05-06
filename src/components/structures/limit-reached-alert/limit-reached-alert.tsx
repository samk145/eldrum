import React from 'react'
import { observer } from 'mobx-react'
import { useTranslation } from 'react-i18next'
import { useStores } from '../../../contexts/stores'
import {
  AlertCardModal,
  type IAlertButton,
  type IAlertCardModalProps
} from '../../units/alert-card-modal/alert-card-modal'

interface ILimitReachedAlertProps extends Pick<IAlertCardModalProps, 'visible' | 'onDismiss'> {
  hideAll?: () => void
  type?: 'newGame' | 'branch'
}

export const LimitReachedAlert: React.FC<ILimitReachedAlertProps> = observer(
  function LimitReachedAlert({ onDismiss, visible, hideAll, type = 'newGame' }) {
    const { t } = useTranslation()
    const { purchase } = useStores()

    const premiumMaximumPlaythroughsText = t(
      type === 'branch'
        ? 'LIMIT_REACHED_ALERT-MESSAGE_BRANCH'
        : 'LIMIT_REACHED_ALERT-MESSAGE_CREATE_GAME',
      { maxPlaythroughs: purchase.maxPlaythroughs }
    )
    const buttons: IAlertButton[] = [
      {
        text: t('CONTINUE_BUTTON-LABEL'),
        onPress: () => (hideAll || onDismiss)()
      }
    ]

    return (
      <AlertCardModal
        onDismiss={onDismiss}
        visible={visible}
        title={t('LIMIT_REACHED_ALERT-TITLE')}
        text={premiumMaximumPlaythroughsText}
        buttons={buttons}
      />
    )
  }
)
