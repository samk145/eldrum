import { StyleSheet } from 'react-native'
import { variables, helpers } from '@actnone/eldrum-engine/styles'

const { fonts } = variables

const style = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: helpers.hexToRgbA(variables.colors.black, 0.3),
    justifyContent: 'center',
    alignItems: 'center'
  },
  innerCard: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: variables.distance * 2,
    paddingBottom: variables.distance * 2,
    paddingLeft: variables.distance * 3,
    paddingRight: variables.distance * 3,
    borderRadius: variables.cardRadius
  },
  text: {
    color: variables.colors.white,
    ...helpers.FontSizeAndLineHeight(fonts.body - 2),
    fontFamily: fonts.demi,
    textTransform: 'uppercase'
  }
})

export default style
