import React from 'react'
import { observer } from 'mobx-react'
import { View } from 'react-native'
import { Image } from 'expo-image'
import { useGameStore, useStores } from '../../../../contexts/stores'
import style from './background.style'

const TRANSITION_OPTIONS = {
  duration: 500,
  effect: 'cross-dissolve'
} as const

const Background = () => {
  const { content } = useStores()
  const game = useGameStore()
  const backgroundSource = game.puppeteer.backgroundImage
    ? content.getMediaSource('image', game.puppeteer.backgroundImage)
    : undefined

  if (!game.puppeteer.backgroundImage) {
    return null
  }

  return (
    <View style={style.wrapper}>
      <Image
        style={style.image}
        source={backgroundSource}
        contentFit="cover"
        cachePolicy="memory"
        transition={
          game.ending.active ? { ...TRANSITION_OPTIONS, duration: 1250 } : TRANSITION_OPTIONS
        }
      />
    </View>
  )
}

export default observer(Background)
