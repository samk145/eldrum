import React from 'react'
import { ScrollView, View } from 'react-native'
import { observer } from 'mobx-react'

import { useGameStore } from '../../../../../contexts/stores'
import MovementOptions from './movement-options/movement-options'
import style from './options.style'
import SceneOptions from './scene-options/scene-options'
import DeathButton from './death-button/death-button'

const Options = () => {
  const game = useGameStore()
  // Prevent rendering if there's a new background image,
  // to avoid displaying the upcoming options prematurely
  if (game.puppeteer.unseenBackground) {
    return null
  }

  return (
    <ScrollView style={style.wrapper}>
      {game.character.alive ? (
        <View style={style.inner}>
          <SceneOptions />
          <MovementOptions />
        </View>
      ) : (
        <View style={style.inner}>
          <DeathButton />
        </View>
      )}
    </ScrollView>
  )
}

export default observer(Options)
