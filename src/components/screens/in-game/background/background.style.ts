import { StyleSheet } from 'react-native'
import { dimensions } from '../../../../styles'

const style = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative'
  },
  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    height: dimensions.height,
    width: dimensions.width
  },
  image: {
    flex: 1,
    height: dimensions.height,
    width: dimensions.width
  }
})

export default style
