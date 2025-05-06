import type { DemoPlayerCombatAttack } from '~demo/models/combat/combat-attack'
import type { DemoPlayerCombatAttackSet } from '~demo/models/combat/combat-attack-set'

import React, { useMemo } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { observer } from 'mobx-react'
import { LinearGradient, type LinearGradientPoint } from 'expo-linear-gradient'
import { useDimensions } from '@actnone/eldrum-engine/hooks'
import { variables, helpers } from '@actnone/eldrum-engine/styles'
import { useDemoCombat } from '~demo/hooks'
import CombatActionButton, { SIZE } from './combat-action-button/combat-action-button'
import AttackButton from './attack-button'
import { BUTTON_SIZE } from './attack-button.style'

const { colors, distance } = variables

const GRADIENT = [
  helpers.hexToRgbA(colors.nightShade, 0),
  helpers.hexToRgbA(colors.nightShade, 0.25)
]

const GRADIENT_START: LinearGradientPoint = [0, 0]
const GRADIENT_END: LinearGradientPoint = [1, 0]

interface IHandActionsProps {
  combatAttackSet?: DemoPlayerCombatAttackSet
}

interface ICombatAttackProps {
  combatAttack: DemoPlayerCombatAttack
  hasSibling: boolean
}

const CombatAttack: React.FC<ICombatAttackProps> = observer(({ combatAttack, hasSibling }) => {
  const { dimensions } = useDimensions()

  return (
    <View
      style={[
        style.attackButton,
        hasSibling && {
          transform: [{ translateX: combatAttack.isWithinRange ? 0 : dimensions.width * 2 }]
        }
      ]}
    >
      <AttackButton combatAttack={combatAttack} />
    </View>
  )
})

const HandActions: React.FC<IHandActionsProps> = observer(({ combatAttackSet }) => {
  const combat = useDemoCombat()
  const enableScrollContainer =
    combat.player.combatActions.length > helpers.getSizeValue(5, 5, 4, 4, 4, 3)

  const sortedActions = useMemo(() => {
    return [...combat.player.combatActions].sort((a, b) => {
      let aWeight = 0
      let bWeight = 0

      const negativeTags = ['utility', 'defensive'] as const

      for (const tag of negativeTags) {
        if (a.tags?.has(tag)) {
          aWeight++
        }

        if (b.tags?.has(tag)) {
          bWeight++
        }
      }

      return aWeight - bWeight
    })
  }, [combat.player.combatActions])

  const combatActionsContainerStyles = useMemo(() => {
    return enableScrollContainer
      ? style.combatActionsContainer
      : [style.combatActionsContainer, style.combatActionsContainerScrollDisabled]
  }, [enableScrollContainer])

  return (
    <View style={style.wrapper}>
      {combatAttackSet && combatAttackSet.combatAttacks?.length > 0 && (
        <View style={style.attackButtons}>
          {combatAttackSet.combatAttacks.map((combatAttack, i) => (
            <CombatAttack
              key={combatAttack.id}
              combatAttack={combatAttack}
              hasSibling={combatAttackSet.combatAttacks.length > 1}
            />
          ))}
        </View>
      )}
      <ScrollView
        style={style.scrollView}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={combatActionsContainerStyles}
        scrollEnabled={enableScrollContainer}
        horizontal
        snapToInterval={
          SIZE + style.combatActionButton.marginLeft + style.combatActionButton.marginRight
        }
      >
        {sortedActions.map(combatAction => (
          <View key={combatAction.uuid} style={style.combatActionButton}>
            <CombatActionButton action={combatAction} />
          </View>
        ))}
      </ScrollView>
      {enableScrollContainer && (
        <LinearGradient
          pointerEvents="none"
          start={GRADIENT_START}
          end={GRADIENT_END}
          style={style.moreContentIndicator}
          colors={GRADIENT}
        />
      )}
    </View>
  )
})

const style = StyleSheet.create({
  wrapper: {
    position: 'relative',
    paddingTop: distance / 4,
    paddingHorizontal: distance / 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center'
  },
  attackButtons: {
    flexDirection: 'row',
    position: 'relative',
    height: BUTTON_SIZE,
    width: BUTTON_SIZE
  },
  attackButton: {
    position: 'absolute'
  },
  scrollView: {
    flexGrow: 0,
    borderRadius: distance * 2,
    marginHorizontal: distance / 6
  },
  combatActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: distance,
    paddingRight: distance
  },
  combatActionsContainerScrollDisabled: {
    paddingRight: 0
  },
  combatActionButton: {
    position: 'relative',
    zIndex: 0,
    marginLeft: distance / 6,
    marginRight: distance / 6
  },
  moreContentIndicator: {
    zIndex: 1,
    position: 'absolute',
    right: distance / 1.5,
    top: distance,
    bottom: distance / 1.5,
    borderTopRightRadius: distance * 2,
    borderBottomRightRadius: distance * 2,
    width: distance
  }
})

export default HandActions
