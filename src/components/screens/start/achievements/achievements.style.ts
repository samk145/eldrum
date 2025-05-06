import { StyleSheet } from 'react-native'
import { variables, styles, dimensions, helpers } from '../../../../styles'

const { distance, colors, fonts } = variables

const style = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: distance,
    paddingBottom: distance
  },
  cardWrapper: {
    width: dimensions.width - distance * 2,
    flex: 1
  },
  progressWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: distance,
    borderBottomColor: variables.colors.nightLight,
    borderBottomWidth: 1
  },
  progressPercentage: {
    ...styles.headline,
    marginTop: distance / 5,
    textAlign: 'center'
  },
  progressLabel: {
    marginTop: distance,
    color: colors.white,
    textTransform: 'uppercase',
    ...helpers.FontSizeAndLineHeight(fonts.body - 2)
  },
  achievementsWrapper: {
    position: 'relative',
    flex: 1
  },
  achievementWrapper: {
    borderTopWidth: 1,
    borderTopColor: variables.colors.nightLight,
    paddingHorizontal: distance,
    paddingVertical: distance
  },
  achievementsWrapperLast: {
    marginBottom: distance
  },
  backButtonWrapper: {
    marginTop: 'auto',
    paddingVertical: distance
  },
  gradient: {
    width: '100%',
    height: distance,
    position: 'absolute',
    zIndex: 10
  },
  bottomGradient: {
    height: distance * 2,
    bottom: 0
  }
})

export default style
