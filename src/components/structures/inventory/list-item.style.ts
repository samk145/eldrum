import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../styles'

const { colors, fonts, distance } = variables
const newDistance = helpers.getSizeValue(-(distance / 4), -(distance / 6))

const style = StyleSheet.create({
  wrapper: {
    paddingTop: distance / 3,
    paddingBottom: distance / 3,
    flexDirection: 'row'
  },
  new: {
    marginTop: newDistance,
    marginLeft: newDistance,
    color: colors.azure,
    fontFamily: variables.fonts.demi,
    textTransform: 'uppercase',
    ...helpers.FontSizeAndLineHeight(fonts.body - 7)
  },
  text: {
    color: colors.faded,
    fontFamily: variables.fonts.default,
    ...helpers.FontSizeAndLineHeight(fonts.body - 2)
  },
  textSelected: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: colors.white,
    color: colors.white
  },
  equipped: {
    color: colors.white,
    fontFamily: variables.fonts.bold,
    fontSize: fonts.body,
    lineHeight: helpers.lineHeightNormalizer(fonts.body - 2)
  }
})

export default style
