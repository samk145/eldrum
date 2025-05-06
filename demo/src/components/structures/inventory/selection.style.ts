import { StyleSheet } from 'react-native'
import { variables } from '@actnone/eldrum-engine/styles'

const { distance } = variables

const style = StyleSheet.create({
  wrapper: {
    flex: 1
  },
  statsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: distance,
    flex: 1
  },
  buttonRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch'
  }
})

export default style
