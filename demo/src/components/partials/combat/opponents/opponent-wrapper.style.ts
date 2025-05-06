import { StyleSheet } from 'react-native'
import { helpers } from '@actnone/eldrum-engine/styles'

const style = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    width: helpers.getSizeValue('25%', '25%', '30%'),
    zIndex: 2
  },
  wrapperThirdRow: {
    zIndex: 1
  },
  wrapperFrontRow: {
    zIndex: 3
  },
  wrapperActive: {
    zIndex: 4
  },
  wrapperSelected: {
    zIndex: 5
  }
})

export default style
