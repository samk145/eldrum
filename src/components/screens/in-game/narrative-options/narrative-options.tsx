import React from 'react'
import { View, TouchableWithoutFeedback } from 'react-native'
import { observer } from 'mobx-react'

import { useGameStore } from '../../../../contexts/stores'
import Options from './options/options'
import { NarrativeTexts } from './narrative-texts/narrative-texts'

const NarrativeAndOptions = () => {
  const { movement, puppeteer } = useGameStore()

  const handleBackgroundPressIn = () => {
    if (!puppeteer.locked && !puppeteer.cutSceneIsActive) {
      puppeteer.showBackgroundStart()
    }
  }

  const handleBackgroundPressOut = () => {
    if (!puppeteer.locked && !puppeteer.cutSceneIsActive) {
      puppeteer.showBackgroundEnd()
    }
  }

  if ((movement.traveling && movement.route) || puppeteer.unseenBackground) {
    return null
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <TouchableWithoutFeedback
        importantForAccessibility="no"
        accessible={false}
        onPressIn={handleBackgroundPressIn}
        onPressOut={handleBackgroundPressOut}
      >
        <View
          style={{
            flex: 1,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        />
      </TouchableWithoutFeedback>

      <NarrativeTexts />
      <Options />
    </View>
  )
}

export default observer(NarrativeAndOptions)
