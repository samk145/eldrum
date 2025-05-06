import { StyleSheet } from 'react-native'
import { variables, styles, helpers } from '../../../styles'

const { colors, distance, fonts } = variables

const style = StyleSheet.create({
  questScrollWrapper: {
    paddingRight: distance,
    paddingLeft: distance
  },
  questTitle: {
    ...styles.headline,
    textAlign: 'center',
    marginBottom: distance / 2
  },
  questDescription: {
    color: colors.white,
    fontFamily: fonts.default,
    fontSize: fonts.body - 2,
    lineHeight: helpers.lineHeightNormalizer(fonts.body - 2) * 1.1
  },
  objectiveList: {
    marginTop: distance,
    paddingBottom: distance * 4
  }
})

export default style
