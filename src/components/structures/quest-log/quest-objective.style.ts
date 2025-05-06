import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../styles'

const { colors, distance, fonts } = variables

const notificationDistance = helpers.getSizeValue(-(distance / 4), -(distance / 6))

const style = StyleSheet.create({
  notification: {
    marginTop: notificationDistance,
    marginLeft: notificationDistance,
    color: colors.azure,
    fontFamily: variables.fonts.demi,
    ...helpers.FontSizeAndLineHeight(fonts.body - 7),
    textTransform: 'uppercase'
  },
  objectiveList: {
    marginTop: distance,
    paddingBottom: distance * 4
  },
  empty: {
    color: colors.faded,
    fontFamily: fonts.defaultItalic,
    opacity: 0.5,
    ...helpers.FontSizeAndLineHeight(fonts.body - 2)
  },
  objectiveDescription: {
    marginTop: distance / 3,
    marginBottom: distance / 3,
    color: colors.faded,
    fontFamily: fonts.defaultItalic,
    ...helpers.FontSizeAndLineHeight(fonts.body - 4)
  },
  objectiveTitleWrapper: {
    flexDirection: 'row'
  },
  objectiveTitle: {
    marginLeft: distance / 4,
    fontSize: fonts.body - 2,
    lineHeight: helpers.lineHeightNormalizer(fonts.body - 2),
    color: colors.white,
    fontFamily: fonts.demi
  },
  objectiveWrapper: {
    marginBottom: distance / 2
  },
  objectiveWrapperCompleted: {
    opacity: 0.3
  }
})

export default style
