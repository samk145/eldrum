import { StyleSheet } from 'react-native'
import { dimensions, variables, helpers } from '../../../../../styles'

const { distance, fonts } = variables

const largeMaxWidth = distance * 26 > dimensions.width ? dimensions.width - 40 : distance * 26
const maxWidth = helpers.getSizeValue(largeMaxWidth, largeMaxWidth, dimensions.width - 40)

function getWrapperHeight() {
  if (dimensions.aspectRatio > 2.2) {
    return '45%'
  } else if (dimensions.aspectRatio > 2) {
    return '40%'
  } else {
    return '35%'
  }
}

const wrapperTopMargin = helpers.getSizeValue(
  distance * 6,
  distance * 6,
  distance * 4,
  distance * 4,
  distance * 4,
  distance * 2
)

const narrativeFontSize = helpers.getSizeValue(fonts.body + 2, fonts.body)
const narrativeLineHeight = helpers.lineHeightNormalizer(
  helpers.getSizeValue(fonts.body + 4, fonts.body + 4, fonts.body + 2)
)

const style = StyleSheet.create({
  wrapper: {
    marginTop: wrapperTopMargin,
    height: getWrapperHeight(),
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  textWrapper: {
    paddingTop: distance,
    paddingBottom: distance,
    paddingLeft: distance / 4,
    paddingRight: distance / 4,
    marginRight: distance,
    marginLeft: distance,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: maxWidth
  }
})

const markdownStyle = StyleSheet.create({
  paragraph: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: fonts.default,
    fontSize: narrativeFontSize,
    lineHeight: narrativeLineHeight,
    letterSpacing: -0.2
  },
  em: {
    fontFamily: fonts.defaultItalic,
    fontSize: narrativeFontSize,
    lineHeight: narrativeLineHeight,
    fontStyle: 'normal'
  },
  strong: {
    fontFamily: fonts.demi,
    fontSize: narrativeFontSize,
    lineHeight: narrativeLineHeight,
    fontWeight: '400'
  }
})

export default { ...style, markdown: markdownStyle }
