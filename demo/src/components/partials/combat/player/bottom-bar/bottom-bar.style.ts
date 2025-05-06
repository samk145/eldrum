import { StyleSheet } from 'react-native'
import { variables } from '@actnone/eldrum-engine/styles'

const { distance, colors } = variables

const style = StyleSheet.create({
  wrapper: {
    width: '100%',
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: distance,
    padding: variables.distance / 2,
    gap: distance / 2
  },
  stanceButtonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  stanceLabel: {
    color: colors.white,
    fontSize: variables.fonts.body - 7,
    textTransform: 'uppercase',
    textAlign: 'right',
    marginRight: variables.distance / 3
  },
  stanceLabelCurrent: {
    fontFamily: variables.fonts.demi,
    fontSize: variables.fonts.body - 7
  }
})

export default style
