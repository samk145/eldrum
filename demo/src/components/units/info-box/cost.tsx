import React from 'react'
import { View, StyleSheet, type ViewStyle } from 'react-native'
import { ActionPoint, Text } from '@actnone/eldrum-engine/components'
import { variables, helpers } from '@actnone/eldrum-engine/styles'

const { colors, distance, fonts } = variables

type TCostProps = {
  actionPoints?: number
  advantage?: number
  style?: ViewStyle
}

export const Cost = ({ actionPoints, advantage, style }: TCostProps) => {
  return (
    <View style={style}>
      {actionPoints && actionPoints > 0 && (
        <View style={styles.costWrapper}>
          <ActionPoint filled diameter={7} />
          <Text style={styles.costValue}>{actionPoints} action</Text>
        </View>
      )}
      {advantage !== undefined && advantage > 0 && (
        <View style={styles.costWrapper}>
          <View style={styles.costIcon}></View>
          <Text style={styles.costValue}>{advantage === Infinity ? '∞' : advantage} advantage</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  costWrapper: {
    flexDirection: 'row',
    marginRight: distance / 4,
    marginLeft: distance / 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  costIcon: {
    height: 7,
    width: 7,
    borderRadius: 100,
    backgroundColor: colors.teal
  },
  costValue: {
    ...helpers.FontSizeAndLineHeight(fonts.body - 6),
    marginLeft: distance / 4,
    textAlign: 'center',
    color: colors.white
  }
})
