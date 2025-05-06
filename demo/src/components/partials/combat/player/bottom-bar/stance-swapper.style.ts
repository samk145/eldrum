import { StyleSheet } from 'react-native'
import { variables, styles } from '@actnone/eldrum-engine/styles'

const { distance } = variables

const style = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingRight: distance,
    paddingBottom: distance,
    paddingLeft: distance
  },
  headline: {
    textAlign: 'center',
    ...styles.headline,
    marginBottom: distance
  }
})

export default style
