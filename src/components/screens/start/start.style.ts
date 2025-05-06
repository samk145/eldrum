import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../styles'

const { distance, fonts } = variables

const style = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    position: 'relative'
  },
  backgroundImage: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    zIndex: -1
  },
  mainWrapper: {
    marginTop: distance * 2,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  logoWrapper: {
    marginTop: distance,
    marginBottom: helpers.getSizeValue(distance * 3, distance * 3, distance * 2, distance * 2)
  },
  menuWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: distance * 13
  },
  menuBottomWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  menuBottomLastChild: {
    marginLeft: distance / 2
  },
  footerWrapper: {
    alignSelf: 'flex-end'
  },
  buttonWrapper: {
    width: '100%',
    marginBottom: distance / 2
  },
  buttonWrapperSmall: {
    width: '50%',
    marginBottom: distance / 2
  },
  loadingStatus: {
    marginTop: distance,
    textAlign: 'center',
    color: '#FFFFFF',
    opacity: 0.5,
    ...helpers.FontSizeAndLineHeight(fonts.body - 2)
  }
})

export default style
