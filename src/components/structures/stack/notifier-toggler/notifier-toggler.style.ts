import { StyleSheet } from 'react-native'
import { variables, helpers, size } from '../../../../styles'

const { colors, distance, fonts } = variables

const style = StyleSheet.create({
  container: {
    width: distance * 3,
    borderTopWidth: 1,
    borderTopColor: colors.nightLight,
    position: 'relative'
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  disabled: {
    opacity: 0.25
  },
  count: {
    color: colors.faded,
    fontFamily: fonts.demi,
    position: 'absolute',
    top: '65%',
    left: '25%',
    ...helpers.FontSizeAndLineHeight(fonts.body - 6)
  },
  bellIcon: {
    color: colors.faded,
    width: size === 'xsmall' ? 12 : 16,
    height: size === 'xsmall' ? 12 : 16
  }
})

export default style
