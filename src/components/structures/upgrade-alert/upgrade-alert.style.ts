import { StyleSheet } from 'react-native'
import { variables } from '../../../styles'

const { distance } = variables

const style = StyleSheet.create({
  productWrapper: {
    flex: 1,
    width: '100%',
    marginBottom: distance * 1.5
  }
})

export default style
