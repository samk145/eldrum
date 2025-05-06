import { StyleSheet } from 'react-native'
import { variables, helpers } from '@actnone/eldrum-engine/styles'

const { colors, distance, fonts } = variables

const COLOR_GOOD = colors.highHealth
const COLOR_BAD = colors.lowHealth
const ICON_SIZE = fonts.body / 2

const style = StyleSheet.create({
  wrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: colors.white,
    textAlign: 'center'
  },
  mainWrapper: {
    marginBottom: distance / 6
  },
  mainText: {
    fontFamily: fonts.demi,
    ...helpers.FontSizeAndLineHeight(fonts.body - 2),
    marginBottom: distance / 12
  },
  secondaryWrapper: {
    marginBottom: distance / 6
  },
  secondaryText: {
    ...helpers.FontSizeAndLineHeight(fonts.body - 4)
  },
  secondaryTextDecrease: {
    color: COLOR_BAD
  },
  secondaryTextNeutral: {
    ...helpers.FontSizeAndLineHeight(fonts.body - 4)
  },
  arrow: {
    marginTop: 1,
    marginLeft: distance / 2
  },
  arrowIncrease: {
    transform: [{ rotate: '-90deg' }]
  },
  arrowDecrease: {
    transform: [{ rotate: '90deg' }]
  },
  change: {
    marginLeft: distance / 6,
    ...helpers.FontSizeAndLineHeight(fonts.body - 6)
  },
  changeIncrease: {
    color: COLOR_GOOD
  },
  changeDecrease: {
    color: COLOR_BAD
  },
  warning: {
    marginLeft: distance / 3,
    marginBottom: -1
  }
})

export { COLOR_GOOD, COLOR_BAD, ICON_SIZE }
export default style
