import { StyleSheet } from 'react-native'
import { variables, styles } from '../../../../styles'

const { distance } = variables

const style = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: distance
  },
  header: {
    ...styles.headline,
    textAlign: 'center',
    marginBottom: distance
  },
  carouselWrapper: {
    flex: 1
  },
  card: {
    marginHorizontal: distance
  },
  paginationItemWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: variables.distance,
    alignSelf: 'center'
  },
  backButtonWrapper: {
    paddingHorizontal: distance,
    gap: distance / 2
  },
  deleteButton: {}
})

export default style
