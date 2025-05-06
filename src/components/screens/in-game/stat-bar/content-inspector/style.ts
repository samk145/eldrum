import { StyleSheet } from 'react-native'
import { variables, styles, helpers } from '../../../../../styles'

const { distance, colors, fonts } = variables

const style = StyleSheet.create({
  headline: {
    ...styles.headline,
    marginBottom: distance,
    textAlign: 'center'
  },
  section: {
    borderTopColor: helpers.hexToRgbA(colors.white, 0.1),
    borderTopWidth: 1,
    paddingTop: distance,
    paddingRight: distance,
    paddingLeft: distance,
    marginBottom: distance,
    gap: distance
  },
  label: {
    fontFamily: fonts.demi,
    color: colors.white,
    fontSize: 14
  },
  npcWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 5
  },
  npcHealthBar: {
    width: 55,
    marginRight: distance / 2
  },
  soundLabel: { ...helpers.FontSizeAndLineHeight(fonts.body - 4) },
  mediaName: {
    fontFamily: variables.fonts.demi
  },
  audioOption: {
    fontFamily: variables.fonts.default
  },
  audioOptionEnabled: {
    color: variables.colors.white
  },
  audioOptionDisabled: {
    color: variables.colors.charcoal
  }
})

export default style
