import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../styles'

const { distance } = variables

const LINK_SIZE = helpers.getSizeValue(50, 45, 35, 30)

const style = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginBottom: distance / 2
  },
  link: {
    margin: distance / 4,
    backgroundColor: '#000000',
    borderRadius: 50,
    width: LINK_SIZE,
    height: LINK_SIZE,
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon: {
    width: LINK_SIZE / 2,
    height: LINK_SIZE / 2
  }
})

export default style
