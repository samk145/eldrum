import { StyleSheet } from 'react-native'
import { variables, styles, helpers } from '../../../styles'

const { distance, colors, fonts } = variables

const style = StyleSheet.create({
  wrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: distance,
    paddingTop: distance,
    paddingBottom: distance * 2.5
  },
  titleWrapper: {
    paddingHorizontal: distance,
    marginBottom: distance
  },
  titleText: {
    textAlign: 'center',
    ...styles.headline
  },
  successTitleText: { textTransform: 'uppercase' },
  textWrapper: {
    marginBottom: distance
  },
  text: {
    textAlign: 'center',
    color: colors.white,
    fontFamily: fonts.default,
    ...helpers.FontSizeAndLineHeight(fonts.body - 2)
  },
  buttonLabel: {},
  buttonWrapper: { width: '100%', marginBottom: distance / 2 }
})

export default style
