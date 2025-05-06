import { StyleSheet, type DimensionValue } from 'react-native'
import { variables, helpers } from '../../../../../styles'

const { distance } = variables

const style = StyleSheet.create({
  wrapper: {
    flex: 1,
    marginTop: distance / 2,
    marginRight: distance,
    marginLeft: distance,
    backgroundColor: 'transparent'
  },
  inner: {
    marginBottom: distance * 8,
    alignItems: 'center'
  },
  optionWrapper: {
    marginBottom: distance / 2,
    width: helpers.getSizeValue<DimensionValue>(distance * 25, '80%', '100%')
  }
})

export default style
