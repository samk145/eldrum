import { StyleSheet } from 'react-native'
import { variables, helpers } from '@actnone/eldrum-engine/styles'

const { colors, distance, fonts } = variables

const style = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: '100%',
    position: 'relative'
  },
  stats: {
    flex: 1,
    paddingTop: distance,
    padding: distance / 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statsWithCombatActions: {
    marginTop: distance / 2
  },
  combatActionsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    top: -distance,
    width: '100%'
  },
  combatAction: {
    marginRight: distance / 6,
    marginLeft: distance / 6
  },
  bottom: {
    width: '100%',
    paddingVertical: distance / 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopColor: colors.night,
    borderTopWidth: 1
  },
  willUnEquipText: {
    opacity: 0.5,
    color: colors.white,
    fontFamily: fonts.defaultItalic,
    ...helpers.FontSizeAndLineHeight(fonts.body - 6),
    marginLeft: distance / 4
  }
})

const CARD_TINT = colors.nightShade
const CARD_CORNER_RADIUS = distance

export { CARD_TINT, CARD_CORNER_RADIUS }
export default style
