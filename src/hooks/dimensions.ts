import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { dimensions, variables } from '../styles'

const IOS_OFFSET_OVERRIDE = 20

function useDimensions() {
  const insets = useSafeAreaInsets()

  if (Platform.OS === 'android' && dimensions.navigationBarHeight > 0) {
    // 'react-native-safe-area-context' doesn't handle immersive mode on Android
    // so we need to override and remove the bottom inset, at the same time making
    // sure we don't end up with a negative inset.
    insets.bottom = Math.max(insets.bottom - dimensions.navigationBarHeight, variables.distance / 2)
  } else if (Platform.OS === 'ios' && insets.bottom > IOS_OFFSET_OVERRIDE) {
    // The default bottom inset provided by 'react-native-safe-area-context' is too high
    // so we're overriding it here.
    insets.bottom = IOS_OFFSET_OVERRIDE
  }

  // This value should be the maximum height of the screen.
  const unifiedMaxHeight = dimensions.height - insets.top - dimensions.statusBarHeight

  return {
    insets,
    maxHeight: unifiedMaxHeight,
    dimensions
  }
}

export { useDimensions }
