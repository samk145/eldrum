import React from 'react'
import { observer } from 'mobx-react'
import { InGame, type TInGameProps } from '../screens/in-game/in-game'
import { useStores } from '../../contexts/stores'
import { Start, type TStartProps } from '../screens/start/start'

type TNavigationProps = {
  startProps: TStartProps
  inGameProps?: TInGameProps
}

export const Navigation = observer((props: TNavigationProps) => {
  const stores = useStores()

  return stores.ui.state === 'in-game' ? (
    <InGame {...props.inGameProps} />
  ) : (
    <Start {...props.startProps} />
  )
})
