import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../styles'

const { distance, fonts, colors } = variables

const getStyles = (useAlternateStyle: boolean) => {
  const WRAPPER_BORDER_RADIUS = 20
  const BORDER_WIDTH = 3

  return StyleSheet.create({
    wrapper: {
      flex: 1
    },
    inner: {
      flex: 1,
      padding: distance,
      backgroundColor: colors.nightLight,
      borderWidth: BORDER_WIDTH,
      borderColor: helpers.hexToRgbA(colors.black, 0),
      overflow: 'hidden',
      borderRadius: WRAPPER_BORDER_RADIUS
    },
    title: {
      fontFamily: fonts.display,
      ...helpers.FontSizeAndLineHeight(fonts.body + 2),
      marginBottom: distance / 2,
      color: colors.white
    },
    imageHorizontal: {
      position: 'absolute',
      bottom: -BORDER_WIDTH,
      top: distance * 2,
      right: 0,
      width: '100%',
      height: '130%',
      zIndex: -10
    },
    imageVertical: {
      position: 'absolute',
      bottom: -BORDER_WIDTH,
      top: distance * 2,
      right: -distance * 2,
      width: '100%',
      height: 'auto',
      zIndex: -10
    },
    perksWrapper: {
      marginBottom: useAlternateStyle ? distance / 2 : distance * 1.5
    },
    perkWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: distance / 3
    },
    perkText: {
      color: colors.white,
      marginLeft: distance / 3,
      ...helpers.FontSizeAndLineHeight(useAlternateStyle ? fonts.body - 4 : fonts.body - 6)
    },
    priceWrapper: {
      marginTop: 'auto',
      alignSelf: 'flex-end',
      zIndex: 1
    },
    price: {
      ...helpers.FontSizeAndLineHeight(fonts.body - 2),
      color: colors.white
    },
    tagWrapper: {
      position: 'absolute',
      top: -distance / 2,
      right: distance / 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingHorizontal: distance * 0.5,
      backgroundColor: colors.azure,
      borderRadius: distance
    },
    tag: {
      fontSize: fonts.body * 0.5,
      color: colors.white,
      textTransform: 'uppercase',
      textAlignVertical: 'center'
    }
  })
}

export const iconColor = colors.turmeric
export default getStyles
