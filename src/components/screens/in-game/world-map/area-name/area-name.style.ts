import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../../../styles'

const style = StyleSheet.create({
  top: {
    position: 'absolute',
    top: variables.distance,
    left: 0,
    right: 0,
    padding: variables.distance,
    zIndex: 1
  },
  areaName: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: variables.fonts.display,
    ...helpers.FontSizeAndLineHeight(variables.fonts.body + 8)
  }
})

export default style
