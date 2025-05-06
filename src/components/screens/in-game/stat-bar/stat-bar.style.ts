import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../../styles'

const { distance } = variables

const menuIconSize = helpers.getSizeValue(28, 20)

const style = StyleSheet.create({
  inner: {
    flex: 1,
    paddingRight: distance,
    paddingLeft: distance,
    flexDirection: 'row',
    alignItems: 'center',
    height: distance * 3,
    marginTop: distance / 4
  },
  statsWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  menu: {
    padding: 5,
    marginLeft: distance / 2
  },
  menuIcon: {
    height: menuIconSize,
    width: menuIconSize
  }
})

export default style
