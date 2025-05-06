import optionStyle from '../options.style'
import { StyleSheet } from 'react-native'
import { variables, helpers, dimensions } from '../../../../../../styles'

const { distance } = variables

const style = StyleSheet.create({
  optionWrapper: optionStyle.optionWrapper,
  saveDataDescription: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: variables.fonts.defaultItalic,
    ...helpers.FontSizeAndLineHeight(variables.fonts.body - 4),
    paddingHorizontal: distance,
    marginBottom: distance,
    opacity: 0.3
  },
  slotName: {
    fontFamily: variables.fonts.demiItalic,
    textTransform: 'lowercase'
  },
  deathButtonOrText: {
    color: variables.colors.white,
    marginBottom: distance
  },
  overlaySavesWrapper: {
    height: dimensions.height - variables.distance * 8
  },
  playthroughsWrapper: {
    flex: 1,
    paddingBottom: helpers.getSizeValue(distance, distance, 0)
  }
})

export default style
