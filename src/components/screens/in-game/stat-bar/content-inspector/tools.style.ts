import { StyleSheet } from 'react-native'
import { variables, styles, helpers } from '../../../../../styles'

const { distance, colors, fonts } = variables

const test = StyleSheet.create({
  wrapper: {
    marginTop: distance / 2
  },
  name: {
    color: colors.white,
    fontFamily: fonts.demi,
    ...helpers.FontSizeAndLineHeight(fonts.body - 2),
    marginBottom: distance / 2
  }
})

const tests = StyleSheet.create({
  wrapper: {
    paddingTop: distance / 2,
    paddingRight: distance,
    paddingLeft: distance,
    marginBottom: distance * 4
  },
  headline: {
    textAlign: 'center',
    marginBottom: distance,
    ...styles.headline
  }
})

const steps = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  step: {
    width: distance - 3,
    height: distance - 3,
    borderRadius: distance - 2,
    marginRight: distance / 2.5,
    marginBottom: distance / 2.5,
    backgroundColor: colors.faded,
    opacity: 0.5
  },
  stepCompleted: {
    opacity: 1,
    backgroundColor: colors.emerald
  },
  stepCurrent: {
    opacity: 1
  }
})

const task = StyleSheet.create({
  wrapper: {
    paddingTop: distance / 4,
    paddingBottom: distance / 2
  },
  name: {
    color: colors.white,
    ...helpers.FontSizeAndLineHeight(fonts.body - 4),
    textTransform: 'uppercase',
    marginBottom: distance / 2.5
  },
  nameInactive: {
    opacity: 0.5
  },
  nameCompleted: {
    textDecorationLine: 'line-through'
  }
})

export { test, task, tests, steps }
