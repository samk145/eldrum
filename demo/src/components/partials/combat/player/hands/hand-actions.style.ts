import { StyleSheet } from 'react-native'
import { variables } from '@actnone/eldrum-engine/styles'
import { BUTTON_SIZE } from './attack-button.style'

const { distance } = variables

const style = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    paddingTop: distance / 4,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  wrapperLeft: {
    width: '100%',
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start'
  },
  wrapperRight: {
    width: '100%',
    justifyContent: 'flex-start'
  },
  attackButtons: {
    flexDirection: 'row',
    position: 'relative',
    height: BUTTON_SIZE,
    width: BUTTON_SIZE
  },
  attackButtonsLeft: {
    marginRight: '-5%'
  },
  attackButtonsRight: {
    marginLeft: '-5%'
  },
  attackButton: {
    position: 'absolute'
  },
  combatActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: distance / 6,
    paddingRight: distance / 6
  },
  combatActionButton: {
    marginLeft: distance / 6,
    marginRight: distance / 6
  }
})

export default style
