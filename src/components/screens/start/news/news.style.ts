import { StyleSheet } from 'react-native'
import { variables } from '../../../../styles'

const { distance } = variables

const style = StyleSheet.create({
  wrapper: {
    marginRight: distance * 2,
    marginLeft: distance * 2,
    maxWidth: distance * 20,
    marginBottom: distance
  }
})

export default style
