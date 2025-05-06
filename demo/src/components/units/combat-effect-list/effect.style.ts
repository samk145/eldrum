import { StyleSheet } from 'react-native'
import { size, variables, helpers } from '@actnone/eldrum-engine/styles'

function getIconSize(deviceSize: string) {
  switch (deviceSize) {
    case 'xxsmall':
      return 17.5
    case 'xsmall':
      return 20
    case 'small':
      return 22.5
    case 'medium':
      return 25
    default:
      return 30
  }
}

const iconSize = getIconSize(size)
const iconSizeSmall = iconSize * 0.6
const quantityWrapperSize = iconSize / 1.5
const quantityWrapperSizeSmall = quantityWrapperSize * 0.8

const style = StyleSheet.create({
  wrapper: {
    marginRight: variables.distance / 5,
    marginLeft: variables.distance / 5
  },
  smallWrapper: {
    marginRight: variables.distance / 10,
    marginLeft: variables.distance / 10
  },
  icon: {
    height: iconSize,
    width: iconSize
  },
  iconSmall: {
    height: iconSizeSmall,
    width: iconSizeSmall
  },
  quantityWrapper: {
    position: 'absolute',
    top: -(quantityWrapperSize / 2),
    right: -(quantityWrapperSize / 3),
    justifyContent: 'center',
    borderRadius: 100,
    backgroundColor: variables.colors.charcoal,
    width: quantityWrapperSize,
    height: quantityWrapperSize
  },
  quantityWrapperSmall: {
    top: -(quantityWrapperSizeSmall / 1.5),
    right: -(quantityWrapperSizeSmall / 2),
    width: quantityWrapperSizeSmall + 2,
    height: quantityWrapperSizeSmall + 2
  },
  quantityLabel: {
    textAlign: 'center',
    ...helpers.FontSizeAndLineHeight(variables.fonts.body - 5),
    color: variables.colors.white,
    fontFamily: variables.fonts.bold
  },
  quantityLabelSmall: {
    ...helpers.FontSizeAndLineHeight(variables.fonts.body - 8)
  }
})

export { iconSize, iconSizeSmall }
export default style
