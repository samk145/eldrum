import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../../styles'

const style = StyleSheet.create({
  wrapper: {
    backgroundColor: helpers.hexToRgbA(variables.colors.white, 0.3),
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: variables.distance / 6
  }
})

export default style
