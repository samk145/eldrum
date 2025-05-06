import { StyleSheet } from 'react-native'
import { variables } from '@actnone/eldrum-engine/styles'
import eventStyle from './generic.style'

const { colors } = variables

const style = StyleSheet.create({
  event: {
    ...eventStyle.event,
    color: colors.garnet
  },
  critical: {
    color: '#FFAF00'
  }
})

export default style
