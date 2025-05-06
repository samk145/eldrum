import type { TCombatAction } from '~demo/models/combat/combat-actions'

import React, { useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import { observer } from 'mobx-react'
import { useTranslation } from 'react-i18next'
import {
  Text,
  RoundButton,
  PopoverTrigger,
  type TPopoverTriggerRenderFn
} from '@actnone/eldrum-engine/components'
import { camelCaseToConstCase } from '@actnone/eldrum-engine/helpers'
import { size, variables, helpers, type TSizePerDimension } from '@actnone/eldrum-engine/styles'
import { CombatInfoBox, InfoBox, Icon } from '~demo/components/units'

const OPACITY_READY = 1
const OPACITY_NOT_READY = 0.2

const { colors, distance } = variables

const customSize: TSizePerDimension = {
  xlarge: 55,
  large: 55,
  medium: 45,
  small: 40,
  xsmall: 35,
  xxsmall: 35
}

export const SIZE = customSize[size]

interface ICombatActionButtonProps {
  action: TCombatAction
}

const CombatActionButton: React.FC<ICombatActionButtonProps> = observer(({ action }) => {
  const { t } = useTranslation()
  const disabled = !action.usable || !action.participant.canPerformAction
  const actionIdUppercase = camelCaseToConstCase(action.id) as Uppercase<typeof action.id>
  const description = t(`COMBAT_ACTION-${actionIdUppercase}-DESC`)
  const title = t(`COMBAT_ACTION-${actionIdUppercase}-NAME`)
  const flavor = t(`COMBAT_ACTION-${actionIdUppercase}-FLAVOR`)

  const combatInfoBoxEffects =
    'particleEffects' in action
      ? action.particleEffects.map(particleEffect =>
          typeof particleEffect === 'string' ? particleEffect : particleEffect.name
        )
      : []

  const accessibilityLabel = InfoBox.getAccessibilityLabel(
    {
      available: action.usable,
      title,
      description,
      cost: { actionPoints: 1, advantage: action.cost }
    },
    t
  )

  const popoverContent = (
    <CombatInfoBox
      title={title}
      icon={action.id}
      effects={combatInfoBoxEffects}
      cost={{ actionPoints: 1, advantage: action.cost }}
      description={description}
      flavorText={flavor}
    />
  )

  const renderPopoverTrigger: TPopoverTriggerRenderFn = useCallback(
    popoverTriggerProps => {
      const handleOnPress = () => {
        if (!popoverTriggerProps.isOpen && !disabled) {
          action.participant.performAction(action.use)
        }
      }

      return (
        <RoundButton
          accessibilityLabel={accessibilityLabel}
          customSize={customSize}
          style={style.iconWrapper}
          onLongPress={popoverTriggerProps.onLongPress}
          delayLongPress={popoverTriggerProps.delayLongPress}
          onPress={handleOnPress}
          onPressIn={popoverTriggerProps.onPressIn}
          onPressOut={popoverTriggerProps.onPressOut}
          icon={props => <Icon name={action.id} {...props} />}
        />
      )
    },
    [accessibilityLabel, disabled, action.id]
  )

  return (
    <View style={{ opacity: action.usable ? OPACITY_READY : OPACITY_NOT_READY, width: SIZE }}>
      <PopoverTrigger scale={1.5} content={popoverContent} render={renderPopoverTrigger} />

      <Text numberOfLines={1} accessible={false} importantForAccessibility="no" style={style.name}>
        {title}
      </Text>
    </View>
  )
})

const style = StyleSheet.create({
  iconWrapper: {
    marginBottom: distance / 3
  },
  icon: {
    width: SIZE / 1.5,
    height: SIZE / 1.5
  },
  name: {
    ...helpers.FontSizeAndLineHeight(variables.fonts.body - 7),
    fontFamily: variables.fonts.default,
    textAlign: 'center',
    color: colors.white,
    textTransform: 'capitalize'
  }
})

export default CombatActionButton
