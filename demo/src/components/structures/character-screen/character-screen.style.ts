import { StyleSheet } from 'react-native'
import { variables, styles, helpers, size } from '@actnone/eldrum-engine/styles'

const { colors, distance, fonts } = variables

// Copied from Button.style.ts in eldrum engine
const compensation = (fontSize: number) => fontSize / 12 // Due to the font 'Ilisarniq' being a little off
export const MINI_FONT_SIZE = variables.fonts.body - 7.5
export const MINI_VERTICAL_PADDING = Math.round(distance / 2.5 - compensation(MINI_FONT_SIZE))

function getIconSize(deviceSize: string) {
  switch (deviceSize) {
    case 'xsmall':
      return 6
    case 'small':
      return 10
    case 'medium':
      return 12
    default:
      return 14
  }
}

export const warningIconSize = getIconSize(size)

const style = StyleSheet.create({
  wrapper: {
    flex: 1
  },
  section: {
    paddingRight: distance,
    paddingLeft: distance
  },
  headline: {
    ...styles.headline,
    textAlign: 'center',
    marginBottom: distance
  },
  experience: {
    marginBottom: distance
  },
  stats: {
    marginBottom: distance,
    paddingBottom: distance,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.nightLight
  },
  derivativeWarningIcon: {
    marginRight: distance / 4
  },
  attacks: {
    marginBottom: distance,
    paddingBottom: distance,
    borderBottomWidth: 1,
    borderBottomColor: colors.nightLight
  },
  gear: {
    marginBottom: distance,
    paddingBottom: distance,
    borderBottomWidth: 1,
    borderBottomColor: colors.nightLight
  },
  gearFieldsValueWrapper: {
    width: '100%',
    flexDirection: 'row'
  },
  gearFieldsValueButtonWrapper: { flex: 3 },
  gearFieldsValueButtonLabel: { color: '#fff' },
  gearFieldsValueAmmunitionWrapper: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50
  },
  gearFieldsValueAmmunitionText: {
    alignItems: 'flex-end',
    fontFamily: variables.fonts.demi,
    color: '#fff',
    ...helpers.FontSizeAndLineHeight(MINI_FONT_SIZE),
    textTransform: 'uppercase',
    fontSize: MINI_FONT_SIZE,
    paddingVertical: MINI_VERTICAL_PADDING,
    textAlign: 'right',
    overflow: 'visible'
  },
  equippedGearFieldsWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  equippedGearFieldsKey: {
    width: variables.distance * 5.5
  },
  combatActions: {
    marginBottom: distance * 2
  },
  attributeWrapper: {
    marginBottom: distance / 2,
    flexDirection: 'row'
  },
  unspentNotice: {
    textAlign: 'center',
    color: colors.turmeric,
    marginBottom: distance,
    fontFamily: fonts.default,
    ...helpers.FontSizeAndLineHeight(fonts.body - 2)
  },
  unspent: {
    fontFamily: fonts.demi,
    ...helpers.FontSizeAndLineHeight(fonts.body + 2)
  },
  attributeSuffix: {
    position: 'absolute',
    top: 0,
    right: -(distance - 3),
    color: colors.white,
    fontFamily: fonts.default,
    ...helpers.FontSizeAndLineHeight(fonts.body - 7)
  },
  combatActionsHeadline: {
    ...styles.legend,
    ...helpers.FontSizeAndLineHeight(fonts.body - 2),
    marginBottom: distance
  },
  combatActionsWrapper: {
    flexDirection: 'row',
    alignContent: 'center'
  },
  combatActionIconWrapper: {
    marginRight: distance / 2,
    backgroundColor: colors.nightLight,
    borderRadius: 100
  },
  combatActionsEmpty: {
    fontStyle: 'italic',
    color: colors.faded,
    ...helpers.FontSizeAndLineHeight(fonts.body - 4)
  }
})

export default style
