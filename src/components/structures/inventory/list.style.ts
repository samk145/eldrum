import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../styles'

const { colors, fonts, distance } = variables

const style = StyleSheet.create({
  wrapper: {
    paddingTop: distance,
    paddingRight: distance,
    paddingBottom: distance,
    paddingLeft: distance,
    flex: 1
  },
  empty: {
    color: colors.faded,
    ...helpers.FontSizeAndLineHeight(fonts.body - 2),
    fontFamily: variables.fonts.defaultItalic,
    opacity: 0.5
  },
  item: {
    paddingTop: distance / 3,
    paddingBottom: distance / 3,
    flexDirection: 'row'
  }
})

export default style
