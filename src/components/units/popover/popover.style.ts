import { StyleSheet } from 'react-native'
import { dimensions, variables, helpers } from '../../../styles'

const { colors } = variables

const style = StyleSheet.create({
  view: {
    backgroundColor: colors.nightShade,
    borderRadius: variables.distance,
    width: Math.min(dimensions.width / 1.25, variables.distance * 18)
  },
  background: {
    backgroundColor: helpers.hexToRgbA(colors.night, 0.7)
  },
  card: {
    margin: -variables.distance
  }
})

export default style
