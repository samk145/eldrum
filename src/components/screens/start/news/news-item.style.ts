import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../../styles'

const { colors, distance } = variables

const style = StyleSheet.create({
  itemWrapper: {
    position: 'relative',
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  itemTitle: {
    margin: variables.distance,
    color: colors.white,
    ...helpers.FontSizeAndLineHeight(variables.fonts.body - 5),
    textAlign: 'center'
  },
  iconWrapper: {
    top: -distance / 6,
    right: -distance / 6,
    backgroundColor: colors.black,
    padding: distance / 3,
    borderRadius: 100,
    position: 'absolute'
  },
  iconSize: {
    height: distance / 2,
    width: distance / 2
  },
  cardStyle: {
    flex: 0
  }
})

export default style
