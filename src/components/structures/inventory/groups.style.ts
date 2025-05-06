import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../styles'

const { colors, distance } = variables

const style = StyleSheet.create({
  wrapper: {
    borderColor: colors.nightLight,
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: distance - helpers.getSizeValue(10, 7.5),
    paddingBottom: helpers.getSizeValue(10, 7.5)
  },
  wrapperWithHidden: {
    justifyContent: 'flex-start'
  }
})

export default style
