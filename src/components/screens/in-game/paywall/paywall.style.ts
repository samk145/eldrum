import { StyleSheet } from 'react-native'
import { variables, styles } from '../../../../styles'

const { colors, distance } = variables

const style = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: distance * 3,
    paddingBottom: distance * 5,
    padding: distance * 2
  },
  headline: {
    ...styles.headline,
    color: colors.white,
    textAlign: 'center',
    marginBottom: distance / 3
  },
  buttonWrapper: {
    marginTop: distance
  }
})

const markdownStyle = {
  ...styles.markdown,
  text: {
    color: colors.white
  }
}

export { markdownStyle }
export default style
