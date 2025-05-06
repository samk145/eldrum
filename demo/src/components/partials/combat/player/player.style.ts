import { StyleSheet } from 'react-native'
import { variables } from '@actnone/eldrum-engine/styles'

const { distance, colors } = variables

const style = StyleSheet.create({
  wrapper: {
    paddingHorizontal: distance
  },
  eventsWrapper: {
    position: 'absolute',
    top: -distance,
    left: 0,
    right: 0,
    zIndex: 2
  },
  stats: {
    marginBottom: distance * 1.5,
    position: 'relative'
  },
  statsLower: {
    flexDirection: 'row',
    gap: distance / 2
  },
  bars: {
    flex: 1,
    gap: distance / 2,
    flexDirection: 'column'
  },
  barValueStyle: {
    textAlign: 'left',
    paddingLeft: distance / 4,
    textTransform: 'uppercase'
  },
  turnButtonActive: {
    backgroundColor: colors.azure
  },
  combatAttackSets: {
    marginBottom: distance
  },
  actionPoints: {
    position: 'relative',
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: distance / 1.5
  }
})

export default style
