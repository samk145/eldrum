import React from 'react'
import { View } from 'react-native'
import { observer } from 'mobx-react'
import { useStores } from '../../../../../contexts/stores'
import fieldsetStyle from '../../../../units/fieldset/fieldset.style'
import { Text, Fieldset } from '../../../../units'

import style from './style'

const Sound = () => {
  const { play, content } = useStores()
  const { sound } = play.game!

  return (
    <View style={style.section}>
      <Fieldset
        legend="Sound"
        hideEmpty={false}
        hideEmptyFields={false}
        fields={Object.entries(sound.mergeAudio(sound.currentAudio)).map(([channel, audio]) => {
          const media = audio?.media ? content.getEntity('media', audio.media) : undefined

          return {
            label: channel,
            value:
              audio && media ? (
                <View>
                  <Text style={[fieldsetStyle.value]}>
                    <Text style={[style.soundLabel, style.mediaName]}>{media.name}</Text>
                    {' • '}
                    <Text style={[style.soundLabel, style.audioOption]}>
                      {audio?.volume ? audio.volume * 100 : ''}%
                    </Text>
                    {' • '}
                    <Text
                      style={[
                        style.soundLabel,
                        audio.loop ? style.audioOptionEnabled : style.audioOptionDisabled
                      ]}
                    >
                      {' '}
                      Loop
                    </Text>
                    {' • '}
                    <Text
                      style={[
                        style.soundLabel,
                        audio.continueFromPreviousPosition
                          ? style.audioOptionEnabled
                          : style.audioOptionDisabled
                      ]}
                    >
                      {' '}
                      Continue
                    </Text>
                  </Text>
                </View>
              ) : (
                '–'
              )
          }
        })}
      />
    </View>
  )
}

export default observer(Sound)
