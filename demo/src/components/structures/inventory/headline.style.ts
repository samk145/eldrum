import { StyleSheet } from 'react-native'
import { variables, styles, helpers } from '@actnone/eldrum-engine/styles'

const { colors, distance, fonts } = variables

const style = StyleSheet.create({
  descriptionWrapper: {
    justifyContent: 'center',
    height: fonts.body * 3,
    marginBottom: distance,
    paddingBottom: distance / 2
  },
  description: {
    color: colors.parchment,
    fontFamily: variables.fonts.defaultItalic,
    textAlign: 'center',
    ...helpers.FontSizeAndLineHeight(fonts.body - 4)
  },
  headline: {
    ...styles.headline,
    marginBottom: distance / 2,
    textAlign: 'center'
  }
})

export default style
