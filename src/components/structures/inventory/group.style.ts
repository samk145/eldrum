import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../styles'

const { colors, fonts } = variables

const groupIconSize = helpers.getSizeValue(34, 34, 24, 24, 20)

const style = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...helpers.getSizeValue(
      {
        height: 85,
        width: 75
      },
      {
        height: 85,
        width: 75
      },
      {
        height: 60,
        width: 50
      },
      {
        height: 60,
        width: 50
      },
      {
        height: 50,
        width: 40
      }
    )
  },
  count: {
    position: 'absolute',
    flexDirection: 'row',
    bottom: 5,
    left: 7.5
  },
  countText: {
    fontFamily: variables.fonts.default,
    ...helpers.FontSizeAndLineHeight(fonts.body - 6),
    color: colors.white
  },
  countNewDot: {
    color: colors.azure,
    fontFamily: variables.fonts.demi,
    marginLeft: 0,
    marginTop: -7,
    ...helpers.FontSizeAndLineHeight(fonts.body - 2)
  },
  icon: {
    opacity: 0.5
  },
  activeIcon: {
    opacity: 1
  }
})

export default style
export { groupIconSize }
