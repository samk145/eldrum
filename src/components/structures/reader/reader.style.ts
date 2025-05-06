import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../styles'

const { distance, fonts } = variables
const TEXT_TOP_DISTANCE = distance * 3

const style = StyleSheet.create({
  wrapper: {
    position: 'relative',
    flex: 1
  },
  textWrapper: {
    paddingHorizontal: distance * 1.5,
    marginTop: TEXT_TOP_DISTANCE / 2,
    paddingTop: TEXT_TOP_DISTANCE / 2,
    marginBottom: distance * 4,
    flex: 1
  },
  markdownWrapper: {
    paddingBottom: distance * 4
  },
  topGradient: {
    position: 'absolute',
    zIndex: 1,
    height: distance * 2,
    right: distance * 1.5,
    top: TEXT_TOP_DISTANCE / 2 - 1, // Avoid visual glitch on Android
    left: distance * 1.5
  },
  buttonWrapper: {
    position: 'absolute',
    paddingVertical: distance * 2,
    paddingHorizontal: distance * 1.5,
    right: 0,
    bottom: 0,
    left: 0
  }
})

const MarkdownStyles = (textColor: string) => {
  return {
    text: {
      color: textColor
    },
    paragraph: {
      fontFamily: fonts.default,
      fontSize: fonts.body - 2,
      lineHeight: helpers.lineHeightNormalizer(fonts.body + 2),
      marginTop: distance / 2,
      marginBottom: distance / 2
    },
    hr: {
      marginTop: distance,
      marginBottom: distance,
      marginRight: distance * 6,
      marginLeft: distance * 5,
      backgroundColor: helpers.hexToRgbA(textColor, 0.25)
    },
    heading1: {
      fontSize: fonts.body + 6,
      fontFamily: fonts.demi,
      lineHeight: Math.round(fonts.lineHeight + 6 * 1.6),
      marginTop: distance / 2,
      marginBottom: distance / 2
    },
    heading2: {
      fontSize: fonts.body,
      fontFamily: fonts.demi,
      lineHeight: Math.round(fonts.lineHeight + 4 * 1.6),
      marginTop: distance,
      marginBottom: distance / 2,
      textTransform: 'uppercase'
    },
    em: {
      fontFamily: fonts.defaultItalic,
      fontStyle: 'normal'
    },
    strong: {
      fontFamily: fonts.demi,
      fontWeight: '400'
    },
    link: {
      textDecorationLine: 'underline'
    }
  }
}

export { style, MarkdownStyles }
