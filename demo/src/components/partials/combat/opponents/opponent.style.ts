import { StyleSheet } from 'react-native'
import { variables, helpers } from '@actnone/eldrum-engine/styles'
import { containerSize } from '~demo/components/units'

const { colors, fonts, distance } = variables

const style = StyleSheet.create({
  boxWrapper: {
    justifyContent: 'center',
    position: 'relative'
  },
  boxWrapperDead: {
    opacity: 0.25
  },
  mainContainer: {
    position: 'relative',
    zIndex: 0,
    padding: helpers.getSizeValue(distance / 1.5, distance / 1.5, distance / 2),
    justifyContent: 'flex-end',
    width: '100%'
  },
  headlineWrapper: {
    position: 'absolute',
    top: -distance * 3.5,
    height: distance * 3,
    left: '-10%',
    width: '120%',
    justifyContent: 'flex-end',
    paddingBottom: distance / 2,
    zIndex: 50
  },
  portraitWrapper: {
    position: 'absolute',
    zIndex: 51
  },
  actionPointsWrapper: {
    marginBottom: distance / 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 52
  },
  headline: {
    fontFamily: fonts.light,
    ...helpers.FontSizeAndLineHeight(helpers.getSizeValue(fonts.body - 2, fonts.body - 4)),
    color: colors.white,
    textAlign: 'center'
  },
  healthBar: {
    marginBottom: distance / 3,
    position: 'relative',
    zIndex: 53
  },
  advantageMeter: {
    position: 'relative',
    zIndex: 52
  },
  upcomingActionLabel: {
    textTransform: 'uppercase',
    ...helpers.FontSizeAndLineHeight(fonts.body - 4),
    color: colors.faded,
    textAlign: 'center',
    marginBottom: distance / 2
  },
  upcomingActionName: {
    textTransform: 'capitalize',
    fontFamily: fonts.light,
    ...helpers.FontSizeAndLineHeight(fonts.body - 4),
    color: colors.white,
    textAlign: 'center'
  },
  eventsWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0
  },
  protectionWrapper: {
    position: 'absolute',
    top: -containerSize / 4,
    right: -containerSize / 4
  }
})

export default style
