import { type ColorValue, StyleSheet } from 'react-native'
import { helpers, variables, size, styles } from '@actnone/eldrum-engine/styles'

const { distance, fonts, colors } = variables

function getIconSize(deviceSize: string) {
  switch (deviceSize) {
    case 'xsmall':
      return 80
    case 'small':
      return 100
    case 'medium':
      return 135
    default:
      return 175
  }
}

const style = StyleSheet.create({
  wrapper: {
    paddingHorizontal: distance * 2,
    paddingTop: distance / 2,
    paddingBottom: distance * 2
  },
  infoWrapper: {
    alignItems: 'center'
  },
  iconWrapper: {
    marginBottom: distance
  },
  title: {
    textTransform: 'uppercase',
    textAlign: 'center',
    ...styles.headline
  },
  description: {
    marginTop: distance / 2,
    color: colors.white
  },
  button: {
    width: '100%',
    marginTop: distance
  }
})

const createMarkdownStyles = (textColor: ColorValue) => {
  return {
    text: {
      color: textColor,
      textAlign: 'center'
    },
    paragraph: {
      fontFamily: fonts.default,
      fontSize: fonts.body - 2,
      lineHeight: helpers.lineHeightNormalizer(fonts.body + 2),
      marginTop: distance / 2,
      marginBottom: distance / 2,
      textAlign: 'center'
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

const iconSize = getIconSize(size)

export { createMarkdownStyles, iconSize }
export default style
