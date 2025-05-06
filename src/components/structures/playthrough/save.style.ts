import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../styles'

const { distance, fonts, colors } = variables

const borderWidth = 3
const compensation = (fonts.body - 2) / 12 // Due to the font 'Ilisarniq' being a little off

const style = StyleSheet.create({
  wrapper: {
    paddingTop: distance / 1.5 - compensation,
    paddingBottom: distance / 1.5 + compensation,
    paddingRight: distance,
    paddingLeft: distance,
    borderRadius: distance,
    position: 'relative',
    zIndex: 1,
    borderColor: colors.night,
    borderWidth
  },
  wrapperDisabled: {
    opacity: 0.35
  },
  wrapperSelected: {
    borderColor: helpers.hexToRgbA(colors.white, 0.2)
  },
  label: {
    marginTop: distance / 3,
    textAlign: 'center',
    color: '#FFFFFF',
    fontFamily: fonts.default,
    fontSize: fonts.body - 2,
    lineHeight: helpers.lineHeightNormalizer(fonts.body + 4)
  },
  narrative: {
    fontFamily: fonts.regular,
    fontSize: fonts.body - 4,
    lineHeight: helpers.lineHeightNormalizer(fonts.body - 2),
    letterSpacing: -0.25
  },
  slotDate: {
    fontFamily: fonts.display,
    fontSize: fonts.body - 4,
    lineHeight: helpers.lineHeightNormalizer(fonts.body),
    opacity: 0.5
  },
  headline: {
    fontFamily: fonts.display
  },
  tagsWrapper: {
    position: 'absolute',
    top: -(fonts.body / 2 + 2),
    left: 0,
    right: distance,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  imageWrapper: {
    backgroundColor: colors.nightShade,
    borderRadius: distance - borderWidth,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    borderRadius: distance - borderWidth,
    height: '100%',
    width: '100%',
    opacity: 0.4
  }
})

export default style
