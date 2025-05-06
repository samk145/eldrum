import { StyleSheet } from 'react-native'
import { variables } from '../../../../styles'

const style = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center'
  },
  mapMaximized: {
    width: '100%',
    flex: 1,
    margin: 0,
    padding: 0,
    overflow: 'hidden'
  },
  mapMinimized: {
    margin: 0,
    padding: 0,
    overflow: 'hidden',
    borderRadius: 100,
    marginBottom: variables.distance * 4.5
  },
  maximizeButton: {
    position: 'absolute',
    justifyContent: 'center',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1
  },
  locationList: {
    flex: 1,
    marginTop: variables.distance * 8,
    marginBottom: variables.distance * 8
  },
  maximizeButtonLabel: {
    color: 'white',
    textAlign: 'center'
  }
})

export default style
