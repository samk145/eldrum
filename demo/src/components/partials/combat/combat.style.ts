import { StyleSheet } from 'react-native'
import { helpers, variables } from '@actnone/eldrum-engine/styles'

const style = StyleSheet.create({
  wrapper: {
    flex: 1
  },
  mainWrapper: {
    flex: 1,
    width: helpers.getSizeValue('90%', '95%', '100%'),
    alignSelf: 'center',
    justifyContent: 'space-between'
  },
  mainWrapperCinematic: {
    paddingBottom: variables.distance * 5
  }
})

export default style
