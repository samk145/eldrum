import { StyleSheet } from 'react-native'
import { variables } from '../../../styles'

const style = StyleSheet.create({
  wrapper: {
    position: 'relative'
  },
  markWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    flexDirection: 'row'
  },
  circle: {
    borderRadius: 100
  },
  text: {
    textTransform: 'uppercase',
    fontFamily: variables.fonts.demi
  }
})

export default style
