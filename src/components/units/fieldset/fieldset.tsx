import React from 'react'
import type { StyleProp, ViewStyle, TextStyle } from 'react-native'
import { View } from 'react-native'
import { Text } from '../text/text'
import style from './fieldset.style'

export interface IFieldsetField {
  label: string
  accessibilityLabel?: string
  value: string | React.ReactNode
  accessibilityValue?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

type TFieldsetProps = {
  fields: IFieldsetField[]
  fieldStyle?: StyleProp<ViewStyle>
  columns?: boolean
  hideEmpty?: boolean
  hideEmptyFields?: boolean
  emptyText?: string
  keyStyle?: StyleProp<TextStyle>
  legend?: string | React.ReactNode
  legendSuffix?: string | React.ReactNode
  valueStyle?: StyleProp<TextStyle> | ((field: IFieldsetField) => StyleProp<TextStyle>)
  wrapperStyle?: StyleProp<ViewStyle>
  valueWrapperStyle?: StyleProp<ViewStyle>
} & { children?: React.ReactNode }

export const Fieldset: React.FC<TFieldsetProps> = ({
  fields,
  fieldStyle,
  columns = true,
  hideEmpty = false,
  hideEmptyFields = false,
  emptyText,
  keyStyle,
  legend,
  legendSuffix,
  valueStyle,
  wrapperStyle,
  valueWrapperStyle,
  children,
  ...rest
}) => {
  const fieldContent = fields
    ? fields
        .filter(field => (hideEmptyFields ? field.value : true))
        .map((field, i) => (
          <View
            key={i}
            style={[
              style.field,
              columns ? style.fieldColumns : style.fieldNonColumns,
              i === fields.length - 1 && style.fieldLast,
              fieldStyle
            ]}
          >
            <Text
              accessibilityLabel={field.accessibilityLabel}
              style={[style.label, columns ? style.labelColumns : style.labelNonColumns, keyStyle]}
            >
              {field.label}
            </Text>
            <View style={[style.valueWrapper, valueWrapperStyle]}>
              {field.prefix && field.prefix}

              {typeof field.value !== 'object' ? (
                <Text
                  accessibilityLabel={field.accessibilityValue}
                  style={[
                    style.value,
                    typeof valueStyle === 'function' ? valueStyle(field) : valueStyle
                  ]}
                >
                  {field.value}
                </Text>
              ) : (
                field.value
              )}

              {typeof field.suffix === 'object' ? field.suffix : null}
            </View>
          </View>
        ))
    : []

  if (!fieldContent.length && hideEmpty) {
    return null
  }

  return (
    <View style={wrapperStyle}>
      <View style={style.legendWrapper}>
        {legend && (
          <Text accessibilityRole="header" style={[style.legend]}>
            {legend}
          </Text>
        )}
        {legendSuffix && <View style={style.legendSuffixWrapper}>{legendSuffix}</View>}
      </View>
      {children}
      {fieldContent}
      {!fieldContent && <Text style={[style.empty]}>{emptyText}</Text>}
    </View>
  )
}
