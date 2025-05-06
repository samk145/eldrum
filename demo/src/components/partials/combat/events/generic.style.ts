import { StyleSheet } from 'react-native'
import { variables, helpers } from '@actnone/eldrum-engine/styles'

const { colors } = variables

const style = StyleSheet.create({
  event: {
    position: 'absolute',
    textAlignVertical: 'center',
    color: colors.white,
    fontFamily: variables.fonts.demi,
    ...helpers.FontSizeAndLineHeight(variables.fonts.body),
    textAlign: 'center',
    textTransform: 'capitalize'
  }
})

export default style
