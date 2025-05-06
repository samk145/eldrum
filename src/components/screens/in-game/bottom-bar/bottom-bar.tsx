import type { Game } from '../../../../models/game'
import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { useGameStore } from '../../../../contexts/stores'
import { useScreenReaderInfo } from '../../../../hooks/accessibility'
import { Stack, type TStackInstance, type TStackProps } from '../../../structures'

export type TBottomBarProps = {
  cards: (game: Game) => TStackProps['cards']
  cardIndex: (game: Game) => TStackProps['index']
  onClose?: (game: Game) => void
  onOpen?: (game: Game) => void
}

const BottomBar: React.FC<TBottomBarProps> = ({ onClose, onOpen, cards, cardIndex }) => {
  const game = useGameStore()
  const isScreenReaderEnabled = useScreenReaderInfo()
  const stackRef = React.useRef<TStackInstance>(null)

  const _onOpen = () => {
    onOpen?.(game)
    game.notifications.close()

    if (isScreenReaderEnabled) {
      game.puppeteer.getMarionette('top').isAccessible = false
      game.puppeteer.getMarionette('narrative').isAccessible = false
      game.puppeteer.getMarionette('map').isAccessible = false
      game.puppeteer.getMarionette('background').isAccessible = false
    }
  }

  const _onClose = () => {
    onClose?.(game)

    if (isScreenReaderEnabled) {
      game.puppeteer.getMarionette('top').isAccessible = true
      game.puppeteer.getMarionette('narrative').isAccessible = true
      game.puppeteer.getMarionette('map').isAccessible = true
      game.puppeteer.getMarionette('background').isAccessible = true
    }
  }

  useEffect(() => {
    if (!game.character.alive) {
      stackRef.current?.close()
    }
  }, [game.character.alive])

  if (game.puppeteer.mapMode === 'maximized') {
    return null
  }

  return (
    <Stack
      ref={stackRef}
      locked={!game.character.alive}
      onOpen={_onOpen}
      onClose={_onClose}
      index={cardIndex(game)}
      cards={cards(game)}
    />
  )
}

export default observer(BottomBar)
