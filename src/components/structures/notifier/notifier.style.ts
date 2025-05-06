import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../styles'

const { colors, distance, fonts } = variables

const quantityWrapperSize = distance

const style = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0
  },
  notificationsWrapper: {
    flex: 1,
    width: '100%',
    paddingTop: distance,
    paddingLeft: distance,
    paddingRight: distance,
    paddingBottom: distance / 2
  },
  card: {
    backgroundColor: colors.nightLight
  },
  notification: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: distance / 2,
    minHeight: distance
  },
  text: {
    textAlign: 'center',
    color: colors.white,
    fontFamily: fonts.default,
    textTransform: 'capitalize',
    ...helpers.FontSizeAndLineHeight(fonts.body - 2)
  },
  quantityWrapper: {
    width: quantityWrapperSize,
    height: quantityWrapperSize,
    backgroundColor: colors.night,
    marginRight: distance / 2,
    borderRadius: quantityWrapperSize / 2,
    justifyContent: 'center'
  },
  quantityLabel: {
    textAlign: 'center',
    color: colors.white,
    fontFamily: fonts.demi,
    ...helpers.FontSizeAndLineHeight(fonts.body - 7)
  }
})

export default style
