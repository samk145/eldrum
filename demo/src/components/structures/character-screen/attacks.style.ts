import { StyleSheet } from 'react-native'
import { variables } from '@actnone/eldrum-engine/styles'

const style = StyleSheet.create({
  valueWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  keyWrapper: {
    width: variables.distance * 5.5
  },
  emptyValue: {
    opacity: 0.3
  }
})

export default style
