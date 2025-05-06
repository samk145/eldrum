import React from 'react'
import { View } from 'react-native'
import { observer } from 'mobx-react'
import { useGameStore } from '../../../../../contexts/stores'
import { Stack } from '../../../../structures'
import Character from './character'
import Opener from './opener'
import SceneMovement from './scene-movement'
import Sound from './sound'
import Tools from './tools'
import Variables from './variables'

const ContentInspector = () => {
  const game = useGameStore()
  const active = game.puppeteer.modal === 'contentInspector'

  const onClose = () => {
    setTimeout(game.puppeteer.closeModal, 200)
  }

  return active ? (
    <View style={{ position: 'absolute', bottom: 0, right: 0, left: 0, zIndex: 99 }}>
      <Stack
        tint="#3C3131"
        onClose={onClose}
        index={active ? 0 : undefined}
        cards={[
          {
            label: 'Scene',
            render: <SceneMovement />
          },
          {
            label: 'Char',
            render: <Character />
          },
          {
            label: 'Sound',
            render: <Sound />
          },
          {
            label: 'Tools',
            render: <Tools onTestStart={onClose} />
          },
          {
            label: 'Vars',
            render: <Variables />
          }
        ]}
      />
    </View>
  ) : null
}

export { Opener }
export default observer(ContentInspector)
