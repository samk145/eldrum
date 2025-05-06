import { StyleSheet } from 'react-native'
import { variables } from '../../../styles'
import { MINI_FONT_SIZE, REGULAR_FONT_SIZE, SMALL_FONT_SIZE } from '../button/button.style'

const { colors, distance } = variables

const fontSizes = {
  mini: MINI_FONT_SIZE,
  small: SMALL_FONT_SIZE,
  regular: REGULAR_FONT_SIZE
}

const marginSizes = {
  mini: distance / 2,
  small: distance / 2.5,
  regular: distance / 3
}

const getSizeStyle = (size: 'mini' | 'small' | 'regular') => {
  return StyleSheet.create({
    wrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    affix: {
      color: colors.white,
      fontSize: fontSizes[size],
      textTransform: size === 'mini' ? 'uppercase' : undefined
    },
    suffix: {
      marginLeft: marginSizes[size]
    },
    prefix: {
      marginRight: marginSizes[size]
    }
  })
}

export default getSizeStyle
