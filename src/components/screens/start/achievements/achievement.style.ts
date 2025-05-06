import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../../styles'

const { distance, fonts, colors } = variables

const style = StyleSheet.create({
  wrapper: {
    flexDirection: 'row'
  },
  details: {
    flex: 1,
    marginLeft: distance / 4
  },
  name: {
    marginTop: -distance / 12,
    marginBottom: distance / 4,
    color: colors.white,
    fontFamily: fonts.demi,
    ...helpers.FontSizeAndLineHeight(fonts.body)
  },
  description: {},
  lightText: {
    color: colors.white,
    opacity: 0.8,
    fontFamily: fonts.light,
    ...helpers.FontSizeAndLineHeight(fonts.body - 4)
  },
  tasks: {
    marginTop: distance / 2,
    paddingRight: distance * 2
  },
  descriptiveTaskWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: distance / 4
  },
  taskDescription: {
    color: colors.white,
    opacity: 0.8,
    fontFamily: fonts.light,
    ...helpers.FontSizeAndLineHeight(fonts.body - 4)
  },
  undiscoveredAchievementName: {
    fontFamily: fonts.demi,
    marginTop: distance / 6,
    marginBottom: 0,
    opacity: 0.5
  },
  undiscoveredTaskDescription: {
    fontFamily: fonts.lightItalic,
    opacity: 0.5
  }
})

export default style
