import React, { useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import { observer } from 'mobx-react'
import { useGameStore } from '../../../../contexts/stores'
import style from './wallpaper.style'

const Wallpaper = () => {
  const { character } = useGameStore()
  const backgroundColor = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (!character.alive) {
      Animated.timing(backgroundColor, {
        toValue: 0,
        duration: 2500,
        useNativeDriver: false
      }).start()
    }
  }, [character.alive])

  return (
    <Animated.View
      style={[
        style.wrapper,
        {
          backgroundColor: backgroundColor.interpolate({
            inputRange: [0, 1],
            outputRange: ['#401E1E', '#1a1a1a']
          })
        }
      ]}
    ></Animated.View>
  )
}

export default observer(Wallpaper)
