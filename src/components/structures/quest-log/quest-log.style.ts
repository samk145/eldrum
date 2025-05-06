import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../styles'

const { colors, distance, fonts } = variables

const radius = helpers.getSizeValue(65, 55, 50, 40)

const style = StyleSheet.create({
  selection: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.nightLight,
    overflow: 'hidden',
    borderTopRightRadius: radius,
    borderTopLeftRadius: radius
  },
  list: {
    height: distance * 10,
    paddingTop: distance,
    paddingRight: distance,
    paddingBottom: distance,
    paddingLeft: distance,
    flexGrow: 0
  },
  empty: {
    color: colors.faded,
    fontFamily: fonts.defaultItalic,
    opacity: 0.5,
    ...helpers.FontSizeAndLineHeight(fonts.body - 2)
  }
})

export default style
