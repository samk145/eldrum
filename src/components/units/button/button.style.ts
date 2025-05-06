import { StyleSheet, type ViewStyle } from 'react-native'
import { variables, helpers } from '../../../styles'

const { distance, colors, fonts } = variables

const compensation = (fontSize: number) => fontSize / 12 // Due to the font 'Ilisarniq' being a little off

// TODO @insats when you do the micro adjustments to these,
// keep in mind these font sizes are imported by the
// affixer component for now, but I believe we should separate
// the styles of the affixer from the button, I am leabing it
// like this so it is easier for you to adjust if you decide
// to keep using the same size for both
export const REGULAR_FONT_SIZE = variables.fonts.body - 2
const REGULAR_VERTICAL_PADDING = Math.round(distance / 1.5 - compensation(REGULAR_FONT_SIZE))
const REGULAR_HORIZONTAL_PADDING = distance

export const SMALL_FONT_SIZE = variables.fonts.body - 4
const SMALL_VERTICAL_PADDING = Math.round(distance / 2 - compensation(SMALL_FONT_SIZE))
const SMALL_HORIZONTAL_PADDING = distance / 2

export const MINI_FONT_SIZE = variables.fonts.body - 7.5
export const MINI_VERTICAL_PADDING = Math.round(distance / 2.5 - compensation(MINI_FONT_SIZE))
export const MINI_HORIZONTAL_PADDING = distance

const generateWrapperStyle = (verticalPadding: number, horizontalPadding: number): ViewStyle => ({
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  paddingTop: verticalPadding,
  paddingBottom: verticalPadding,
  paddingRight: horizontalPadding,
  paddingLeft: horizontalPadding
})

const style = StyleSheet.create({
  outerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  wrapper: generateWrapperStyle(REGULAR_VERTICAL_PADDING, REGULAR_HORIZONTAL_PADDING),
  wrapperIconOnly: generateWrapperStyle(REGULAR_VERTICAL_PADDING, REGULAR_HORIZONTAL_PADDING),
  wrapperSmall: generateWrapperStyle(SMALL_VERTICAL_PADDING, SMALL_HORIZONTAL_PADDING),
  wrapperSmallIconOnly: generateWrapperStyle(SMALL_VERTICAL_PADDING, SMALL_VERTICAL_PADDING),
  wrapperMini: generateWrapperStyle(MINI_VERTICAL_PADDING, MINI_HORIZONTAL_PADDING),
  wrapperMiniIconOnly: generateWrapperStyle(MINI_VERTICAL_PADDING, MINI_VERTICAL_PADDING),
  wrapperDisabled: {
    opacity: 0.35
  },
  wrapperRight: {
    alignSelf: 'flex-end'
  },
  wrapperLeft: {
    alignSelf: 'flex-start'
  },
  label: {
    zIndex: 1,
    color: colors.white,
    textAlign: 'center',
    fontFamily: fonts.default,
    ...helpers.FontSizeAndLineHeight(REGULAR_FONT_SIZE)
  },
  labelSmall: {
    ...helpers.FontSizeAndLineHeight(SMALL_FONT_SIZE)
  },
  labelMini: {
    fontFamily: fonts.demi,
    ...helpers.FontSizeAndLineHeight(MINI_FONT_SIZE),
    textTransform: 'uppercase'
  },
  labelUsed: {
    color: '#919191'
  },
  labelDisabled: {},
  iconWrapper: {
    marginLeft: distance / 4,
    marginRight: -(distance / 8)
  },
  iconWrapperIconOnly: {
    marginLeft: 0,
    marginRight: 0
  },
  icon: {
    color: colors.white,
    height: REGULAR_FONT_SIZE,
    width: REGULAR_FONT_SIZE
  },
  iconSmall: {
    height: SMALL_FONT_SIZE,
    width: SMALL_FONT_SIZE
  },
  iconMini: {
    height: MINI_FONT_SIZE,
    width: MINI_FONT_SIZE
  }
})

export default style
