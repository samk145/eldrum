import { StyleSheet } from 'react-native'
import { size, variables, helpers, type TSizePerDimension } from '@actnone/eldrum-engine/styles'

const { colors, fonts, distance } = variables

export const customButtonSize: TSizePerDimension = {
  xlarge: 50,
  large: 45,
  medium: 40,
  small: 35,
  xsmall: 35,
  xxsmall: 35
}

const style = StyleSheet.create({
  wrapper: {
    alignItems: 'center'
  },
  label: {
    marginTop: distance / 4,
    ...helpers.FontSizeAndLineHeight(variables.fonts.body - 10),
    color: colors.white,
    textTransform: 'uppercase',
    fontFamily: fonts.default
  },
  icon: {
    height: customButtonSize[size] * 0.55,
    width: customButtonSize[size] * 0.55
  }
})

export default style
