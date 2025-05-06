import { StyleSheet } from 'react-native'
import { variables, styles, helpers } from '../../../styles'

const { colors, distance, fonts } = variables

const style = StyleSheet.create({
  legendWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: distance / 1.5
  },
  legend: {
    ...styles.legend
  },
  legendSuffixWrapper: {
    marginLeft: distance / 2
  },
  field: {
    marginBottom: distance / 3
  },
  fieldLast: {
    marginBottom: 0
  },
  fieldColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  fieldNonColumns: {
    marginBottom: distance
  },
  label: {
    fontFamily: variables.fonts.default,
    ...helpers.FontSizeAndLineHeight(fonts.body - 2),
    color: colors.faded
  },
  labelNonColumns: {
    ...helpers.FontSizeAndLineHeight(fonts.body - 4),
    textTransform: 'uppercase',
    marginBottom: distance / 4
  },
  labelColumns: {
    marginRight: distance / 2
  },
  valueWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  value: {
    fontFamily: variables.fonts.default,
    ...helpers.FontSizeAndLineHeight(fonts.body - 2),
    color: colors.white
  },
  empty: {
    color: colors.faded,
    fontFamily: fonts.defaultItalic,
    ...helpers.FontSizeAndLineHeight(fonts.body - 4)
  }
})

export default style
