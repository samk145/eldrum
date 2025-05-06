import React, { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import {
  Button,
  PopoverTrigger,
  type TPopoverTriggerRenderFn
} from '@actnone/eldrum-engine/components'
import { useScreenReaderInfo } from '@actnone/eldrum-engine/hooks'
import { CombatInfoBox, InfoBox } from '~demo/components/units'

const OPACITY_READY = 1
const OPACITY_NOT_READY = 0.2

interface IActionButton {
  label: string
  longLabel?: string
  disabled: boolean
  description?: string
  flavorText?: string
  icon?: string
  action: () => any
  actionPointsCost: number
  advantageCost?: number
}

const ActionButton: React.FC<IActionButton> = ({
  label,
  longLabel,
  action,
  icon,
  disabled,
  description,
  flavorText,
  actionPointsCost,
  advantageCost
}) => {
  const { t } = useTranslation()
  const screenReaderEnabled = useScreenReaderInfo()
  const cost = {
    actionPoints: actionPointsCost,
    advantage: advantageCost
  }

  const accessibilityLabel = InfoBox.getAccessibilityLabel(
    {
      available: !disabled,
      title: longLabel || label,
      description,
      flavorText,
      cost
    },
    t
  )

  const popoverContent = useMemo(
    () => (
      <CombatInfoBox
        cost={cost}
        title={longLabel || label}
        description={description}
        flavorText={flavorText}
      />
    ),
    [longLabel, label, flavorText, description]
  )

  const renderPopoverTrigger: TPopoverTriggerRenderFn = useCallback(
    popoverTriggerProps => {
      const onPress = () => {
        if (!popoverTriggerProps.isOpen && !disabled) {
          action()
        }

        popoverTriggerProps.onPressOut()
      }

      return (
        <Button
          accessibilityLabel={accessibilityLabel}
          size="mini"
          icon={icon}
          label={label}
          onLongPress={popoverTriggerProps.onLongPress}
          delayLongPress={popoverTriggerProps.delayLongPress}
          onPressIn={popoverTriggerProps.onPressIn}
          onPress={onPress}
          onPressOut={popoverTriggerProps.onPressOut}
        />
      )
    },
    [disabled, accessibilityLabel, label, icon, action, screenReaderEnabled]
  )

  return (
    <View style={{ opacity: disabled ? OPACITY_NOT_READY : OPACITY_READY }}>
      <PopoverTrigger scale={1.2} content={popoverContent} render={renderPopoverTrigger} />
    </View>
  )
}

export default memo(ActionButton)
