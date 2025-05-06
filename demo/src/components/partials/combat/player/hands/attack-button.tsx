import type { DemoPlayerCombatAttack } from '~demo/models/combat/combat-attack'

import React, { useCallback, useMemo } from 'react'
import { View } from 'react-native'
import { observer } from 'mobx-react'
import { useTranslation } from 'react-i18next'
import { useStores } from '@actnone/eldrum-engine/contexts'
import {
  Text,
  RoundButton,
  PopoverTrigger,
  type TPopoverTriggerRenderFn
} from '@actnone/eldrum-engine/components'
import { CombatInfoBox } from '~demo/components/units'
import style, { customButtonSize, customButtonBorderWidth } from './attack-button.style'

const OPACITY_READY = 1
const OPACITY_NOT_READY = 0.2

interface IAttackButtonProps {
  combatAttack: DemoPlayerCombatAttack
}

const AttackButton: React.FC<IAttackButtonProps> = observer(({ combatAttack }) => {
  const { t } = useTranslation()
  const { ui } = useStores()
  const disabled = !combatAttack.usable || !combatAttack.possessor.canPerformAction
  const { min, max } = combatAttack.attack.damage

  const accessibilityLabel = (() => {
    const { min, max } = combatAttack.attack.damage

    let label: string = combatAttack.usageTerm + '\n'

    if (disabled) {
      label += `${t('UNAVAILABLE_LABEL')}. `
    }

    label += `${t('VALUE-MIN_TO_MAX-LABEL', { minValue: min, maxValue: max })}`

    if (combatAttack.ranged) {
      label += `${t('CHARACTER-DERIVATIVE-RANGED_DAMAGE')}.`
      label += `${t('INVENTORY-AMMUNITION_QUANTITY')}: ${combatAttack.ammunitionQuantity}.`
    } else {
      label += `${t('CHARACTER-DERIVATIVE-MELEE_DAMAGE')}.`
    }

    return label
  })()

  const popoverContent = useMemo(
    () => (
      <CombatInfoBox
        title={combatAttack.title}
        cost={{ actionPoints: 1 }}
        description={combatAttack.description}
        icon="parry"
      />
    ),
    [combatAttack.title, combatAttack.description]
  )

  const handleOnPress = useCallback(() => {
    if (!ui.popoverVisible && !disabled) {
      combatAttack.possessor.performAction(combatAttack.use)
    }
  }, [ui.popoverVisible, disabled])

  const popoverRender = useCallback<TPopoverTriggerRenderFn>(
    ({ onLongPress, onPressIn, onPressOut, delayLongPress }) => (
      <RoundButton
        customSize={customButtonSize}
        accessibilityLabel={accessibilityLabel}
        touchSoundDisabled={true}
        style={style.wrapper}
        borderWidth={customButtonBorderWidth}
        borderColor="#FFF"
        onLongPress={onLongPress}
        delayLongPress={delayLongPress}
        onPress={handleOnPress}
        onPressOut={onPressOut}
        onPressIn={onPressIn}
        label={
          <View>
            <Text style={style.label}>{combatAttack.usageTerm}</Text>
            <Text style={style.damage}>
              {min}-{max}
            </Text>
          </View>
        }
      >
        {combatAttack.ranged && (
          <View style={style.quantityWrapper}>
            <Text style={style.quantity}>{combatAttack.ammunitionQuantity}</Text>
          </View>
        )}
      </RoundButton>
    ),
    [
      handleOnPress,
      accessibilityLabel,
      combatAttack.ranged,
      combatAttack.ammunitionQuantity,
      min,
      max,
      combatAttack.usageTerm
    ]
  )

  return (
    <View style={{ opacity: disabled ? OPACITY_NOT_READY : OPACITY_READY }}>
      <PopoverTrigger content={popoverContent} render={popoverRender}></PopoverTrigger>
    </View>
  )
})

export default AttackButton
