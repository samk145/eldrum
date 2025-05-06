import { StyleSheet } from 'react-native'
import { iconSize, iconSizeSmall } from './effect.style'

const style = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: -(iconSize * 0.25),
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
    zIndex: 1
  },
  smallWrapper: {
    top: -(iconSizeSmall * 0.25)
  }
})

export default style
