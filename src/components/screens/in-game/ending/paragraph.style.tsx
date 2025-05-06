import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../../styles'

const { colors, fonts, distance } = variables

const style = StyleSheet.create({
  text: {
    textAlign: 'center'
  },
  paragraph: {
    textAlign: 'center',
    color: colors.white,
    marginBottom: distance / 2,
    fontFamily: fonts.default,
    ...helpers.FontSizeAndLineHeight(fonts.body)
  },
  heading1: {
    textAlign: 'center',
    fontFamily: fonts.display,
    color: colors.turmeric,
    marginTop: distance,
    marginBottom: distance,
    ...helpers.FontSizeAndLineHeight(fonts.body + 12)
  },
  heading2: {
    textAlign: 'center',
    fontFamily: fonts.display,
    color: colors.turmeric,
    marginTop: distance * 2,
    marginBottom: distance / 2,
    textTransform: 'uppercase',
    ...helpers.FontSizeAndLineHeight(fonts.body + 4)
  },
  em: {
    fontFamily: fonts.defaultItalic,
    fontStyle: 'normal'
  },
  strong: {
    fontFamily: fonts.demi,
    fontWeight: '400'
  }
})

export default style
