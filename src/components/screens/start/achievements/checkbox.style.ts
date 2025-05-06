import { StyleSheet } from 'react-native'
import { variables } from '../../../../styles'

const { distance, colors } = variables

const style = StyleSheet.create({
  wrapper: {
    marginRight: distance / 2,
    borderRadius: 100,
    backgroundColor: colors.matte,
    opacity: 0.6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  wrapperIsChecked: {
    opacity: 1,
    backgroundColor: colors.teal
  }
})

export default style
