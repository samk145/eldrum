import { StyleSheet } from 'react-native'
import { variables, dimensions } from '@actnone/eldrum-engine/styles'

const { distance } = variables

const style = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    flexDirection: 'column',
    maxHeight: dimensions.height / 3,
    marginRight: distance / 2,
    marginLeft: distance / 2,
    justifyContent: 'flex-end',
    alignItems: 'center'
  }
})

export default style
