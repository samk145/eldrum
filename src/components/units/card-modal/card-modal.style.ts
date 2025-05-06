import { type StyleProp, StyleSheet, type ViewStyle } from 'react-native'
import { type Insets } from 'react-native-popover-view/dist/Types'
import { variables, dimensions } from '../../../styles'

const { colors, distance } = variables

const DEFAULT_INSETS = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
}

const getCardCloser = (insets: Insets = {}): StyleProp<ViewStyle> => {
  const finalInsets = { ...DEFAULT_INSETS, ...insets }

  return {
    position: 'absolute',
    zIndex: 9999,
    top: 5 + finalInsets.top,
    left: 0 + finalInsets.left,
    right: 0 + finalInsets.right,
    height: 85 - finalInsets.bottom,
    paddingTop: distance / 2,
    alignItems: 'center'
  }
}

const style = StyleSheet.create({
  wrapper: {
    width: '100%',
    position: 'absolute',
    alignItems: 'center'
  },
  portalWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999
  },
  overlay: {
    ...StyleSheet.absoluteFillObject
  },
  overlayPressable: {
    flex: 1
  },
  cardStyle: {
    width: Math.min(dimensions.width, distance * 30)
  },
  cardCloserIndicator: {
    borderRadius: 10,
    height: 5,
    width: distance * 3,
    opacity: 0.15,
    backgroundColor: colors.faded
  },
  cardWithCloser: {
    paddingTop: distance * 2
  }
})

export default { ...style, getCardCloser }
