import React from 'react'
import { View } from 'react-native'
import { observer } from 'mobx-react'
import { useTranslation } from 'react-i18next'
import { Text, CardModal, AccessibilityFocus } from '@actnone/eldrum-engine/components'
import type { PlayerCombatParticipant } from '@actnone/eldrum-engine/models'
import CombatStances from './combat-stances'
import style from './stance-swapper.style'

interface IStanceSwapperProps {
  visible: boolean
  close: () => void
  player: PlayerCombatParticipant
}

const StanceSwapper: React.FC<IStanceSwapperProps> = ({ visible, close, player }) => {
  const { t } = useTranslation()

  return (
    <CardModal
      useOverlay
      onOverlayPress={close}
      overlayOpacity={0.3}
      visible={visible}
      onHandleDragSuccess={close}
    >
      <View style={style.wrapper}>
        <AccessibilityFocus id="StanceSwapperHeadline">
          <Text style={style.headline}>{t('COMBAT-STANCE_SWAPPER-TITLE')}</Text>
        </AccessibilityFocus>
        <CombatStances
          changeCurrentStance={name =>
            player.performAction(() => {
              player.changeStance(name)
              close()
            })
          }
          current={player.stanceId}
        />
      </View>
    </CardModal>
  )
}

export default observer(StanceSwapper)
