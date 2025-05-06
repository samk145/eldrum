import React from 'react'
import { Linking, ScrollView, Platform } from 'react-native'
import { observer } from 'mobx-react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { logger } from '../../../../helpers/logger'
import { useStores, useGameStore, useConfig } from '../../../../contexts/stores'
import { Button, Text, CardModal, Icon } from '../../../units'
import style, { iconSize } from './beta-end.style'

const DISCORD_URL = 'http://discord.eldrum.com'

const message = `You've reached the end of this beta, which contains the prelude of the full game.

There are many different paths you can take through the burning city, so you might want to give it another go and see where you end up.

We'd also like to invite you to come hang out with us on Discord and share your experience!
`

const BetaEnd = () => {
  const config = useConfig()
  const stores = useStores()
  const game = useGameStore()

  const preorderUrl =
    Platform.OS === 'android'
      ? `https://play.google.com/store/apps/details?id=${config.androidPackageName}`
      : `https://apps.apple.com/app/id${config.appStoreId}`

  if (!config.betaEndOptionId) {
    logger.error('Attempting to render BetaEnd component without a valid betaEndOptionId.')
    return null
  }

  return (
    <CardModal
      useOverlay
      useHandler={false}
      visible={game.statistics.hasUsedOption(config.betaEndOptionId)}
    >
      <ScrollView style={style.wrapper}>
        <SafeAreaView style={style.innerWrapper}>
          <Icon style={style.icon} name="rookDagger" height={iconSize} width={iconSize} />
          <Text style={style.headline}>{"That's it for now!"}</Text>
          <Text style={style.text}>{message}</Text>
          <Button
            wrapperStyle={style.button}
            label="Join the Discord server"
            onPress={() => Linking.openURL(DISCORD_URL)}
          />
          <Button
            wrapperStyle={style.button}
            label={'Preorder the game'}
            onPress={() => Linking.openURL(preorderUrl)}
          />
          <Button
            wrapperStyle={style.button}
            label={'Restart the beta from the beginning'}
            onPress={stores.play.newGame}
          />
          <Button
            wrapperStyle={style.button}
            label={'Load from the most recent save'}
            onPress={() => stores.play.loadFromLatestSave(undefined, true)}
          />
        </SafeAreaView>
      </ScrollView>
    </CardModal>
  )
}

export default observer(BetaEnd)
