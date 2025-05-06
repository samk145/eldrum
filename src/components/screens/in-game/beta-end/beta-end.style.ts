import { StyleSheet } from 'react-native'
import { variables, dimensions, styles, helpers } from '../../../../styles'

const { distance } = variables
const iconSize = helpers.getSizeValue(175, 150, 125, 125, 125, 100)

const style = StyleSheet.create({
  wrapper: {
    height: dimensions.height - distance * 8,
    flex: 1
  },
  innerWrapper: {
    paddingVertical: distance * 2,
    paddingHorizontal: distance,
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon: {
    marginBottom: distance
  },
  button: {
    marginBottom: distance / 2,
    width: '100%'
  },
  headline: {
    ...styles.headline,
    textAlign: 'center'
  },
  text: {
    color: 'white',
    marginVertical: variables.distance,
    textAlign: 'center',
    fontSize: variables.fonts.body - 2
  }
})

export default style
export { iconSize }
