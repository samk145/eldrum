import { StyleSheet } from 'react-native'
import { variables } from '../../../styles'

const style = StyleSheet.create({
  wrapper: {
    position: 'relative',
    backgroundColor: '#404040',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible'
  },
  barsWrapper: {
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 0
  },
  progress: {
    backgroundColor: '#919191',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 0
  },
  valuesWrapper: {
    position: 'relative',
    top: 0,
    height: '300%',
    width: '100%',
    zIndex: 9999,
    justifyContent: 'center'
  },
  values: {
    color: variables.colors.white,
    fontFamily: variables.fonts.demi,
    opacity: 1,
    textAlign: 'center'
  }
})

export default style
