import type { TSizePerDimension } from '@actnone/eldrum-engine/styles'
import { StyleSheet } from 'react-native'
import { variables, helpers, size } from '@actnone/eldrum-engine/styles'

const { colors } = variables

const customButtonSize: TSizePerDimension = {
  xxsmall: 60,
  xsmall: 65,
  small: 65,
  medium: 75,
  large: 95,
  xlarge: 110
}

const customButtonBorderWidth = helpers.getSizeValue(6, 5, 3)
const QUANTITY_BADGE_SIZE = helpers.getSizeValue(25, 20, 15)
const BUTTON_SIZE = customButtonSize[size] + customButtonBorderWidth

const style = StyleSheet.create({
  wrapper: {
    position: 'relative'
  },
  labelWrapper: {
    flexDirection: 'column'
  },
  label: {
    ...helpers.FontSizeAndLineHeight(variables.fonts.body - 5),
    fontFamily: variables.fonts.regular,
    textAlign: 'center',
    textTransform: 'capitalize',
    color: colors.white,
    marginBottom: variables.distance / 6
  },
  damage: {
    ...helpers.FontSizeAndLineHeight(variables.fonts.body - 7),
    fontFamily: variables.fonts.bold,
    textAlign: 'center',
    color: colors.matte
  },
  quantityWrapper: {
    width: QUANTITY_BADGE_SIZE,
    height: QUANTITY_BADGE_SIZE,
    borderRadius: 100,
    backgroundColor: colors.white,
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 5
  },
  quantity: {
    color: colors.black,
    lineHeight: QUANTITY_BADGE_SIZE,
    fontSize: variables.fonts.body - 8,
    textAlign: 'center'
  }
})

export { customButtonSize, customButtonBorderWidth, BUTTON_SIZE }
export default style
