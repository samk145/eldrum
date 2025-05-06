import { StyleSheet } from 'react-native'
import { variables, helpers, size } from '../../../styles'

const { colors, distance, fonts } = variables

const bottomOffset = 5

const style = StyleSheet.create({
  bottom: {
    position: 'relative',
    zIndex: 3
  },
  tabs: {
    flexDirection: 'row',
    height: distance * 3 + bottomOffset,
    position: 'relative',
    zIndex: 2,
    backgroundColor: colors.night
  },
  tabWrapper: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.nightLight
  },
  tabWrapperActive: {
    borderTopColor: colors.white
  },
  tab: {
    marginBottom: bottomOffset,
    paddingRight: distance / 2,
    paddingLeft: distance / 2,
    color: colors.faded,
    textTransform: 'uppercase',
    fontFamily: fonts.default,
    ...helpers.FontSizeAndLineHeight(fonts.body - 3)
  },
  tabActive: {
    color: colors.white
  },
  tabDisabled: {
    opacity: 0.25
  },
  highlighter: {
    flex: 1
  },
  notification: {
    width: distance / 2
  },
  notificationAndroidBg: {
    position: 'relative',
    zIndex: 3
  },
  notifierToggler: {
    width: distance * 3,
    borderTopWidth: 1,
    borderTopColor: colors.nightLight,
    position: 'relative'
  },
  notifierTogglerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  notifierTogglerDisabled: {
    opacity: 0.25
  },
  notifierTogglerCount: {
    color: colors.faded,
    fontFamily: fonts.demi,
    position: 'absolute',
    top: '65%',
    left: '25%',
    ...helpers.FontSizeAndLineHeight(fonts.body - 6)
  },
  bellIcon: {
    color: colors.faded,
    width: size === 'xsmall' ? 12 : 16,
    height: size === 'xsmall' ? 12 : 16
  }
})

export default style
