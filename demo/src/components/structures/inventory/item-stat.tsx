import type { EquipChange } from '@actnone/eldrum-engine/models'

import React from 'react'
import { View, type ViewStyle, type TextStyle } from 'react-native'
import { useTranslation } from 'react-i18next'
import { formatPercentage } from '@actnone/eldrum-engine/helpers'
import { Icon, Text } from '@actnone/eldrum-engine/components'
import style, { ICON_SIZE, COLOR_GOOD, COLOR_BAD } from './item-stat.style'

type TStatType = 'main' | 'secondary' | 'modifier' | 'immunity'

type TItemStatProps = {
  type: TStatType
  equipChange?: EquipChange
  label?: string
  value?: string | number
  showWarning?: boolean
  wrapperStyle?: ViewStyle
  textStyle?: TextStyle
  accessibilityLabel?: string
}

export const ItemStat = ({
  type,
  label,
  value,
  equipChange,
  wrapperStyle,
  textStyle,
  showWarning = false,
  accessibilityLabel
}: TItemStatProps) => {
  const { t } = useTranslation()

  const wrapperStyles = [
    style.wrapper,
    type === 'main' && style.mainWrapper,
    type === 'secondary' && style.secondaryWrapper,
    wrapperStyle
  ]

  const textStyles = [
    style.text,
    type === 'main' && style.mainText,
    type === 'secondary' && style.secondaryText,
    textStyle
  ]

  const text = (type === 'main' ? [value, label] : [label, value]).join(' ')

  const _accessibilityLabel = (function () {
    return `${accessibilityLabel || text} ${
      showWarning ? `(${t('INVENTORY-ITEM-REQUIREMENT_NOT_MET-LABEL')})` : ''
    }.`
  })()

  const formattedEquipChange = (function () {
    if (equipChange) {
      if (label?.toLowerCase().includes('chance')) {
        return formatPercentage(equipChange.toValue - equipChange.fromValue)
      } else {
        return Math.round(equipChange.toValue - equipChange.fromValue)
      }
    }
  })()

  return (
    <View style={wrapperStyles} accessible>
      <Text style={textStyles} accessibilityLabel={_accessibilityLabel}>
        {text}
      </Text>
      {equipChange?.isIncrease !== null &&
        equipChange &&
        equipChange.fromValue !== 0 &&
        formattedEquipChange !== 0 && (
          <>
            <Icon
              name="fromTo"
              width={ICON_SIZE}
              height={ICON_SIZE}
              style={[
                style.arrow,
                equipChange.isIncrease ? style.arrowIncrease : style.arrowDecrease
              ]}
              fill={equipChange.isIncrease ? COLOR_GOOD : COLOR_BAD}
            />
            <Text
              accessibilityLabel={`(${
                equipChange.isIncrease ? t('INCREASE_LABEL') : t('DECREASE_LABEL')
              } ${formattedEquipChange})`}
              style={[
                style.change,
                equipChange.isIncrease ? style.changeIncrease : style.changeDecrease
              ]}
            >
              {formattedEquipChange}
            </Text>
          </>
        )}
      {showWarning && (
        <Icon
          style={style.warning}
          name="warning"
          width={ICON_SIZE}
          height={ICON_SIZE}
          fill={COLOR_BAD}
        />
      )}
    </View>
  )
}

export default ItemStat
