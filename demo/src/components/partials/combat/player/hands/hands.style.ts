import { StyleSheet } from 'react-native'
import { size, variables, helpers, type TSizePerDimension } from '@actnone/eldrum-engine/styles'
import { BUTTON_SIZE } from './attack-button.style'

// Copied from RoundButton
const miniDimension: TSizePerDimension = {
  xlarge: 35,
  large: 35,
  medium: 30,
  small: 25,
  xsmall: 25,
  xxsmall: 25
}

const { fonts, distance } = variables

// Copied from Button
const MINI_FONT_SIZE = variables.fonts.body - 7.5

const sourceIconProps = {
  height: MINI_FONT_SIZE * 1.2,
  width: MINI_FONT_SIZE * 1.2
}

const hands = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'center'
  }
})

const hand = StyleSheet.create({
  wrapper: {
    borderRadius: distance * 2,
    height: BUTTON_SIZE + distance * 2,
    width: '100%',
    justifyContent: 'center'
  },
  wrapperLeft: {
    marginRight: helpers.getSizeValue(distance * 2, distance * 2, distance / 1.5)
  },
  wrapperRight: {
    marginLeft: helpers.getSizeValue(distance * 2, distance * 2, distance / 1.5)
  },
  wrapperDouble: {
    width: '50%'
  },
  sourceWrapper: {
    position: 'absolute',
    alignItems: 'center',
    width: '100%',
    top: -miniDimension[size] / 2
  },
  sourceWrapperLeft: {
    alignItems: 'flex-end',
    paddingRight: distance
  },
  sourceWrapperRight: {
    alignItems: 'flex-start',
    paddingLeft: distance
  },
  sourceWrapperUnarmed: {
    fontFamily: fonts.defaultItalic
  },
  sourceLabel: {
    textTransform: 'none',
    ...helpers.FontSizeAndLineHeight(fonts.body - 6)
  }
})

export { sourceIconProps }
export default {
  hands,
  hand
}
