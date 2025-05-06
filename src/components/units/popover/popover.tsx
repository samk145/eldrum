import React from 'react'
import { Easing } from 'react-native'
import { observer } from 'mobx-react'
import RNPopoverView, { PopoverMode } from 'react-native-popover-view'
import { useStores } from '../../../contexts'
import { variables } from '../../../styles'
import style from './popover.style'

const ANIMATION_CONFIG = { duration: 175, easing: Easing.inOut(Easing.sin) }
const ARROW_SIZE = { width: variables.distance / 1.5, height: variables.distance / 1.5 }

export const Popover = observer(function Popover() {
  const { ui } = useStores()

  return (
    <RNPopoverView
      from={ui.popoverRef}
      offset={variables.distance * 1.5}
      mode={PopoverMode.JS_MODAL}
      animationConfig={ANIMATION_CONFIG}
      isVisible={ui.popoverVisible}
      popoverStyle={style.view}
      backgroundStyle={style.background}
      onRequestClose={ui.closePopover}
      onCloseComplete={ui.prunePopover}
      arrowSize={ARROW_SIZE}
    >
      {ui.popoverContent}
    </RNPopoverView>
  )
})
