import type { Combat as CombatClass } from '@actnone/eldrum-engine/models'
import React, { useEffect, useState } from 'react'
import { View, type ViewProps } from 'react-native'
import { observer } from 'mobx-react'
import { useDimensions } from '@actnone/eldrum-engine/hooks'
import { variables, helpers } from '@actnone/eldrum-engine/styles'
import { useDemoStores, useDemoGameStore } from '~demo/hooks'
import Opponents from './opponents/opponents'
import Turns from './turns/turns'
import TurnNotice from './turn-notice/turn-notice'
import Player from './player/player'
import style from './combat.style'
import PreCombatInformation from './pre-combat-information/pre-combat-information'

const baseDistance = helpers.getSizeValue(
  variables.distance * 2,
  variables.distance * 2,
  variables.distance * 1.5,
  variables.distance
)

const getHasPreCombatInformation = (combat: CombatClass | null): boolean => {
  return Boolean(
    (combat && !combat.automated && combat.combatOptions?.customTurnOrder?.length) ||
      combat?.combatOptions?.isConfinedSpace
  )
}

const AccessibilityWrapper = observer(
  ({ children, ...rest }: { children: React.ReactNode } & ViewProps) => {
    const game = useDemoGameStore()
    const combat = game.combat!

    return (
      <View
        accessible={combat.player.isOnCooldown ? false : undefined}
        importantForAccessibility={combat.player.isOnCooldown ? 'no-hide-descendants' : 'auto'}
        {...rest}
      >
        {children}
      </View>
    )
  }
)

const Combat = () => {
  const { ui, settings } = useDemoStores()
  const game = useDemoGameStore()
  const { combat } = game
  const [showPreCombatInformationModal, setShowPreCombatInformationModal] = useState(false)
  const { insets } = useDimensions()
  const distanceTop = Math.max(insets.top, baseDistance)
  const distanceBottom = insets.bottom + baseDistance
  const hasPreCombatInformation = getHasPreCombatInformation(combat)

  useEffect(() => {
    if (combat?.engaged) {
      if (hasPreCombatInformation) {
        setShowPreCombatInformationModal(true)
      } else {
        combat?.init()
      }
    }
  }, [combat?.engaged, hasPreCombatInformation])

  if (!combat?.engaged) {
    return null
  }

  const handleClosePreCombatInformationModal = () => {
    setShowPreCombatInformationModal(false)
    combat.init()
  }

  const wrapperStyles = [
    style.wrapper,
    {
      paddingTop: distanceTop,
      paddingBottom: distanceBottom
    }
  ]

  const content = (
    <>
      <View
        style={[
          style.mainWrapper,
          settings.values.cinematicModeEnabled && style.mainWrapperCinematic
        ]}
      >
        {!settings.values.cinematicModeEnabled && <Turns />}
        <Opponents />
        <Player />
      </View>
      {!ui.screenReaderEnabled && <TurnNotice />}
    </>
  )

  return (
    <>
      {ui.screenReaderEnabled ? (
        <AccessibilityWrapper style={wrapperStyles}>{content}</AccessibilityWrapper>
      ) : (
        <View style={wrapperStyles}>{content}</View>
      )}
      <PreCombatInformation
        visible={showPreCombatInformationModal}
        close={handleClosePreCombatInformationModal}
        combatOptions={combat.combatOptions}
        participants={combat.participants}
      />
    </>
  )
}

export default observer(Combat)
