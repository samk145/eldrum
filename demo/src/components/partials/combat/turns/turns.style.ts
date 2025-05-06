import { StyleSheet } from 'react-native'
import { variables, dimensions } from '@actnone/eldrum-engine/styles'

const { distance, colors, fonts } = variables

const size = distance * 1.5

const style = StyleSheet.create({
  headline: {
    textAlign: 'center',
    color: colors.white,
    textTransform: 'uppercase',
    fontSize: fonts.body - 6,
    marginBottom: distance
  },
  turnsWrapper: {
    position: 'relative',
    left: -size / 2,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    height: size,
    width: dimensions.width * 2,
    zIndex: 1,
    marginLeft: '50%'
  }
})

export default style
