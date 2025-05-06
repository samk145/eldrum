import { StyleSheet } from 'react-native'
import {
  variables,
  size as dimensionSize,
  type TSizePerDimension,
  type TUISize
} from '../../../styles'

const ICON_SIZE_FACTOR = 0.6

const compensation = variables.fonts.body / 9 // Due to the font 'Ilisarniq' being a little off

export const miniDimension: TSizePerDimension = {
  xlarge: 35,
  large: 35,
  medium: 30,
  small: 25,
  xsmall: 25,
  xxsmall: 25
}

export const smallDimension: TSizePerDimension = {
  xlarge: 35,
  large: 45,
  medium: 40,
  small: 30,
  xsmall: 30,
  xxsmall: 30
}

export const regularDimension: TSizePerDimension = {
  xlarge: 35,
  large: 50,
  medium: 45,
  small: 35,
  xsmall: 35,
  xxsmall: 35
}

export const defaultSizes: Record<TUISize, TSizePerDimension> = {
  mini: miniDimension,
  small: smallDimension,
  regular: regularDimension
}

export const calculatePngSize = (customSize: TSizePerDimension): TUISize => {
  if (customSize[dimensionSize] > regularDimension[dimensionSize]) {
    return 'regular'
  } else if (customSize[dimensionSize] > smallDimension[dimensionSize]) {
    return 'small'
  }

  return 'mini'
}

export const getSizeStyles = ({
  size,
  customSize,
  borderWidth
}: {
  size: TUISize
  customSize: TSizePerDimension | undefined
  borderWidth: number
}) => {
  const currentSize = customSize ? customSize[dimensionSize] : defaultSizes[size][dimensionSize]

  return StyleSheet.create({
    wrapper: {
      height: currentSize + borderWidth,
      width: currentSize + borderWidth,
      borderRadius: currentSize + borderWidth
    },
    wrapperDisabled: {
      opacity: 0.35
    },
    contentWrapper: {
      flex: 1,
      minHeight: currentSize + borderWidth,
      alignSelf: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      alignItems: 'center'
    },
    background: {
      height: currentSize,
      width: currentSize,
      borderRadius: currentSize
    },
    icon: {
      height: currentSize * ICON_SIZE_FACTOR,
      width: currentSize * ICON_SIZE_FACTOR,
      borderRadius: currentSize * ICON_SIZE_FACTOR,
      color: '#FFFFFF'
    }
  })
}

const style = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },

  label: {
    zIndex: 2,
    textAlign: 'center',
    marginBottom: compensation,
    fontSize: variables.fonts.body - compensation,
    color: variables.colors.white,
    fontFamily: variables.fonts.default
  },
  circleBackground: {
    zIndex: -1,
    position: 'absolute'
  }
})

export default style
