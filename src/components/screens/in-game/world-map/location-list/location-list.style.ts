import { StyleSheet } from 'react-native'
import { variables } from '../../../../../styles'

const style = StyleSheet.create({
  wrapper: {
    flex: 1,
    marginRight: variables.distance,
    marginLeft: variables.distance
  },
  optionWrapper: {
    marginBottom: variables.distance / 2
  },
  currentOptionLabel: {
    color: variables.colors.azure
  }
})

export default style
