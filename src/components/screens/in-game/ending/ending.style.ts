import type { TSizePerDimension } from '../../../../styles'
import { StyleSheet } from 'react-native'
import { variables, helpers, dimensions } from '../../../../styles'

const { distance } = variables
const textContainerWidth = helpers.getSizeValue('75%', '75%', '100%')

const customButtonSize: TSizePerDimension = {
  xxsmall: 65,
  xsmall: 65,
  small: 65,
  medium: 75,
  large: 95,
  xlarge: 110
}

const style = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: helpers.hexToRgbA('#382813', 0.5),
    alignItems: 'center'
  },
  wrapperCredits: {
    backgroundColor: helpers.hexToRgbA(variables.colors.black, 0.7)
  },
  paragraphsWrapper: {
    height: dimensions.height * 0.5,
    position: 'relative',
    width: textContainerWidth,
    overflow: 'hidden'
  },
  paragraphsWrapperInner: {
    position: 'absolute',
    paddingHorizontal: distance * 1.5,
    top: '100%',
    right: 0,
    left: 0
  },
  scrollViewInner: {
    marginTop: dimensions.height / 3,
    paddingHorizontal: distance * 1.5
  },
  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: -1
  },
  buttonWrapper: {
    paddingHorizontal: variables.distance * 2,
    paddingTop: variables.distance * 3,
    paddingVertical: variables.distance * 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%'
  },
  button: {
    width: '100%'
  }
})

export { customButtonSize }
export default style
