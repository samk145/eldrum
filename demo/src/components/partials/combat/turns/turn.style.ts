import { StyleSheet } from 'react-native'
import { variables, helpers } from '@actnone/eldrum-engine/styles'

const { distance, colors, fonts } = variables

const size = Math.round(distance * 1.5)

const style = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    backgroundColor: colors.nightShade,
    borderRadius: 5,
    width: size,
    height: size,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderWidth: 1,
    borderColor: helpers.hexToRgbA(colors.black, 0),
    overflow: 'hidden'
  },
  wrapperHasPassed: {
    opacity: 0.2,
    backgroundColor: colors.black,
    zIndex: 0
  },
  wrapperSelected: {
    backgroundColor: colors.night,
    zIndex: 4
  },
  wrapperCurrentTurn: {
    borderColor: colors.azure,
    zIndex: 3
  },
  wrapperIsPlayer: {
    zIndex: 2
  },
  portraitWrapper: {
    flex: 1,
    paddingTop: distance / 2,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    right: -size / 2,
    bottom: -size / 15,
    left: -size / 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  portrait: {
    width: '250%',
    height: size * 5,
    transform: [{ scale: 0.5 }]
  },
  name: {
    color: colors.white,
    fontSize: fonts.body - 8
  }
})

export default style
