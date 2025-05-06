import type { PlayerCombatParticipant } from '@actnone/eldrum-engine/models'

import React, { useState, useCallback } from 'react'
import { observer } from 'mobx-react'
import { Button, Card } from '@actnone/eldrum-engine/components'
import { variables } from '@actnone/eldrum-engine/styles'
import { useTranslation } from 'react-i18next'
import ActionButton from './action-button'
import StanceSwapper from './stance-swapper'
import style from './bottom-bar.style'

interface IBottomBarProps {
  player: PlayerCombatParticipant
}

const BottomBar: React.FC<IBottomBarProps> = ({ player }) => {
  const { t } = useTranslation()
  const [showStanceSwapper, setShowStanceSwapper] = useState<boolean>(false)
  const onStanceSwapperOpen = useCallback(() => setShowStanceSwapper(true), [])
  const onStanceSwapperClose = useCallback(() => setShowStanceSwapper(false), [])

  return (
    <Card
      corners="all"
      cornerSize={variables.distance}
      tint={variables.colors.nightShade}
      cardOpacity={0.35}
      style={style.wrapper}
    >
      <ActionButton
        icon="stance"
        label={t('COMBAT-ACTION-STANCE_SWAP-LABEL')}
        longLabel={t('COMBAT-ACTION-STANCE_SWAP-TITLE')}
        description={t('COMBAT-ACTION-STANCE_SWAP-DESC')}
        disabled={!player.canPerformAction}
        action={onStanceSwapperOpen}
        actionPointsCost={1}
      />
      <Button
        icon="leave"
        size="mini"
        label={t('COMBAT-ACTION-END_TURN-LABEL')}
        onPress={player.endTurn}
      />
      <StanceSwapper player={player} visible={showStanceSwapper} close={onStanceSwapperClose} />
    </Card>
  )
}

export default observer(BottomBar)
