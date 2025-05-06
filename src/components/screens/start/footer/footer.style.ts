import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../../styles'

const { colors, distance, fonts } = variables

const soundIconSize = helpers.getSizeValue(28, 20)

const style = StyleSheet.create({
  bottomWrapper: {
    paddingBottom: distance * 2,
    alignItems: 'center'
  },
  bottomTextWrapper: {
    opacity: 0.5
  },
  bottomTextRow: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  bottomText: {
    textAlign: 'center',
    color: colors.white,
    ...helpers.FontSizeAndLineHeight(fonts.body - 5)
  },
  restoreLink: {
    marginLeft: distance / 5,
    marginBottom: distance / 4,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)'
  },
  settingsIconWrapper: {
    marginBottom: distance,
    height: soundIconSize,
    width: soundIconSize
  },
  credits: {
    backgroundColor: colors.nightLight
  },
  settingsContainer: {
    flexDirection: 'row',
    gap: distance / 2
  }
})

export default style
