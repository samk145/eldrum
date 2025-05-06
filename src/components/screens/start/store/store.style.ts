import { StyleSheet } from 'react-native'
import { variables, styles } from '../../../../styles'

const { distance, colors, fonts } = variables

const style = StyleSheet.create({
  wrapper: {
    width: '100%',
    flex: 1,
    padding: distance
  },
  header: {
    ...styles.headline,
    textAlign: 'center',
    marginBottom: distance
  },
  cardWrapper: {
    flex: 1,
    paddingVertical: distance * 2,
    paddingHorizontal: distance,
    marginBottom: distance,
    justifyContent: 'space-between'
  },
  productsListWrapper: {
    flex: 1
  },
  productWrapper: {
    marginBottom: distance
  },
  productChecklistItem: {
    flexDirection: 'row',
    marginTop: distance / 4,
    alignItems: 'center'
  },
  productChecklistItemText: {
    fontSize: fonts.body * 0.7,
    marginLeft: distance / 2,
    color: colors.white
  },
  restorePurchasesButtonWrapper: {
    marginBottom: distance / 2
  },
  loadingWrapper: {
    justifyContent: 'center',
    flex: 1
  },
  buttonWrapper: {}
})

export default style
