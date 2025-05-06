import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../styles'

const { distance, fonts } = variables

const style = StyleSheet.create({
  playtime: {
    color: variables.colors.white,
    marginBottom: distance,
    ...helpers.FontSizeAndLineHeight(fonts.body - 4),
    opacity: 0.4
  }
})

export default style
