import React from 'react'
import { View, StyleSheet, type ViewProps } from 'react-native'
import { Text } from '../text/text'
import { variables, helpers } from '../../../styles'

const { distance, fonts, colors } = variables

type TTagProps = {
  label: string
} & ViewProps

export const Tag = ({ label, style, ...rest }: TTagProps) => {
  return (
    <View style={[styles.tag, style]} {...rest}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  tag: {
    justifyContent: 'center',
    backgroundColor: colors.nightShade,
    minWidth: distance * 4,
    borderRadius: 100,
    paddingVertical: distance * 0.3,
    paddingHorizontal: distance * 0.5,
    marginLeft: distance * 0.3
  },
  tagText: {
    textTransform: 'uppercase',
    color: '#FFFFFF',
    textAlign: 'center',
    ...helpers.FontSizeAndLineHeight(fonts.body / 2.4)
  }
})
