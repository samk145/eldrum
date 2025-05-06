import { StyleSheet } from 'react-native'
import { variables, styles } from '@actnone/eldrum-engine/styles'

const { distance } = variables

const style = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: distance,
    paddingBottom: distance
  },
  headline: {
    textAlign: 'center',
    marginBottom: distance,
    ...styles.headline
  },
  slotButton: { marginBottom: distance }
})

export default style
