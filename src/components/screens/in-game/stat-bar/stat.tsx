import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet } from 'react-native'
import { Text } from '../../../units'
import { helpers, variables } from '../../../../styles'

const { distance } = variables

type TStatProps = {
  label: string
  abbreviation?: string
  value: number
  maxValue?: number
  valueWidth: number
}

export const Stat = ({ label, abbreviation, value, maxValue, valueWidth }: TStatProps) => {
  const { t } = useTranslation()
  const showWarning = maxValue !== undefined && value > maxValue

  return (
    <View
      style={style.container}
      accessible
      accessibilityLabel={` ${label}: ${maxValue ? t('VALUE-X_OF_Y-LABEL', { value, total: maxValue }) : value}`}
    >
      <Text style={style.label}>{abbreviation || label}</Text>
      <View style={[style.valueWrapper, { width: valueWidth }]}>
        <Text style={[style.value, showWarning && style.warningValue]}>{value}</Text>
        {maxValue !== undefined && <Text style={style.maxValue}>/ {maxValue}</Text>}
      </View>
    </View>
  )
}

export const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: distance / 4
  },
  label: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: variables.fonts.light,
    ...helpers.FontSizeAndLineHeight(variables.fonts.body - 7),
    marginRight: distance / 3,
    textTransform: 'uppercase'
  },
  valueWrapper: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  value: {
    fontFamily: variables.fonts.default,
    ...helpers.FontSizeAndLineHeight(variables.fonts.body - 2),
    color: 'rgba(255,255,255,0.7)'
  },
  warningValue: {
    color: variables.colors.turmeric
  },
  maxValue: {
    fontFamily: variables.fonts.default,
    ...helpers.FontSizeAndLineHeight(variables.fonts.body - 8),
    color: 'rgba(255,255,255,0.9)',
    marginTop: 1,
    marginLeft: distance / 8
  }
})
