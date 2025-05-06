import { StyleSheet } from 'react-native'
import { variables, helpers } from '../../../styles'

const { distance, colors } = variables

const style = StyleSheet.create({
  wrapper: {
    flex: 1
  },
  scrollListWrapper: {
    flex: 1
  },
  headerWrapper: {
    flexDirection: 'row',
    marginTop: distance * 1.5,
    paddingHorizontal: distance * 1.5,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  gradient: {
    width: '100%',
    height: distance,
    position: 'absolute',
    zIndex: 10
  },
  bottomGradient: {
    height: distance * 2,
    bottom: 0
  },
  savesList: {
    flexDirection: 'column',
    paddingVertical: 20
  },
  save: {
    marginHorizontal: distance,
    marginBottom: distance
  },
  date: {
    color: colors.white,
    ...helpers.FontSizeAndLineHeight(variables.fonts.body - 4),
    textAlign: 'center',
    marginHorizontal: distance / 4,
    opacity: 0.3
  },
  deleteButton: {
    marginHorizontal: distance / 4
  },
  loadButtonWrapper: {
    marginHorizontal: distance,
    marginBottom: distance,
    alignItems: 'center'
  },
  loadButton: {
    width: '100%',
    marginVertical: distance / 2
  },
  paginationItemWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: 100,
    marginVertical: variables.distance,
    alignSelf: 'center'
  },
  backButtonWrapper: {
    marginTop: 'auto'
  }
})

export default style
