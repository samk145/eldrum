import React from 'react'
import { View, StyleSheet } from 'react-native'
import { variables } from '../../../styles'

const { colors, distance } = variables

export const SelectionWrapper = ({ children }: { children?: React.ReactNode }) => {
  return <View style={styles.container}>{children}</View>
}

const styles = StyleSheet.create({
  container: {
    height: distance * 18,
    paddingRight: distance,
    paddingBottom: distance,
    paddingLeft: distance,
    borderBottomWidth: 1,
    borderBottomColor: colors.nightLight
  }
})
