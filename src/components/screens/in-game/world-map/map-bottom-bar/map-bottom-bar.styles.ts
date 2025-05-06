import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../../../styles'

const reCenterButtonIconSize = helpers.getSizeValue(20, 16)

const style = StyleSheet.create({
  reCenterButton: {
    paddingRight: variables.distance / 2,
    paddingLeft: variables.distance / 2,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1
  },
  buttons: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: variables.distance * 1.5
  },
  buttonWrapper: {
    marginRight: variables.distance / 2,
    marginLeft: variables.distance / 2
  }
})

export { style, reCenterButtonIconSize }
