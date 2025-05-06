import type { Stores } from '../stores'
import type Save from '../models/database/schemas/save'
import { useEffect } from 'react'
import { DevSettings } from 'react-native'
import * as Clipboard from 'expo-clipboard'

export const useCustomDevSettings = (stores: Stores) => {
  const { settings, play } = stores

  useEffect(() => {
    if (__DEV__) {
      DevSettings.addMenuItem('Toggle cinematic mode', () => {
        settings.changeSetting('cinematicModeEnabled', !settings.values.cinematicModeEnabled)
      })

      DevSettings.addMenuItem('Load save from clipboard', async () => {
        const clipboard = await Clipboard.getStringAsync()

        if (!clipboard) {
          return
        }

        const parsedSave = JSON.parse(clipboard) as Save

        if (play.game) {
          await play.game.unmount()
        }

        play.loadGame(parsedSave)
      })
    }
  }, [])
}
