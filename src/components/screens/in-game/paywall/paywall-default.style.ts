import { StyleSheet } from 'react-native'
import { variables, size, helpers } from '../../../../styles'
import paywallStyle from './paywall.style'

const { colors, distance, fonts } = variables

export const isAlternateStyle = size === 'xsmall' || size === 'xxsmall'

const style = StyleSheet.create({
  wrapper: paywallStyle.wrapper,
  headline: {
    ...paywallStyle.headline,
    color: colors.turmeric
  },
  messageWrapper: {
    marginBottom: distance
  },
  productsList: isAlternateStyle
    ? {
        flexDirection: 'column-reverse',
        marginBottom: distance / 2
      }
    : {
        flexDirection: 'row',
        marginBottom: distance / 2,
        marginHorizontal: -distance
      },
  lastProduct: {
    marginLeft: isAlternateStyle ? 0 : distance / 2
  },
  buttonWrapper: {
    marginBottom: distance / 2
  },
  buttonLabel: {
    color: colors.black
  },
  branchingInfo: {
    textAlign: 'center',
    ...helpers.FontSizeAndLineHeight(fonts.body - 6),
    color: colors.white,
    opacity: 0.5,
    marginBottom: distance
  }
})

export const buttonBackgroundColor = colors.white
export { markdownStyle } from './paywall.style'
export default style
