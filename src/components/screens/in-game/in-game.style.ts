import { StyleSheet } from 'react-native'

const style = StyleSheet.create({
  wrapper: {
    flex: 1,
    zIndex: 0
  },
  wallpaper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0
  },
  narrative: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 8
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1
  },
  combat: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5
  },
  ending: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 15
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 12
  }
})

export default style
