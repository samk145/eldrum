import { StyleSheet } from 'react-native'
import { variables, helpers, styles } from '../../../../styles'

const { colors, distance, fonts } = variables

const style = StyleSheet.create({
  wrapper: {
    marginBottom: distance
  },
  headline: {
    textAlign: 'center',
    color: colors.white,
    fontFamily: fonts.demi,
    textTransform: 'uppercase',
    ...helpers.FontSizeAndLineHeight(fonts.body - 4)
  },
  body: {
    opacity: 0.8
  },
  link: {
    textDecorationLine: 'underline'
  }
})

const markdownStyle = {
  ...styles.markdown,
  text: {
    textAlign: 'center',
    color: colors.white,
    fontFamily: fonts.demiItalic,
    ...helpers.FontSizeAndLineHeight(fonts.body - 6)
  }
}

export { markdownStyle }
export default style
