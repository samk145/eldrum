import type { AppStateStatus } from 'react-native'
import type { Game } from './game'
import type { EditorAudio } from '@actnone/eldrum-editor/dist/types'

import { AppState } from 'react-native'
import { reaction, computed } from 'mobx'
import { logger } from '../helpers/logger'
import Track from './track'

type TTrackChannels = {
  1: Track | null
  2: Track | null
  3: Track | null
  4: Track | null
  5: Track | null
  ui: Track | null
}

type TAudioChannels = {
  1: EditorAudio | null
  2: EditorAudio | null
  3: EditorAudio | null
  4: EditorAudio | null
  5: EditorAudio | null
  ui: EditorAudio | null
}

export class Sound {
  constructor(private readonly _game: Game) {
    // This variable exists in order to be able to trigger a reset
    // of audio after combat has occured, if the outcome after combat
    // is a narrative. It's needed because we can't trigger a
    // reset on node outcome because it will be triggered already
    // by currentAudioPerChannel() which will be re-run when the node changes.
    this.audioChangeThroughCombatHasTakenPlace = false

    AppState.addEventListener('change', this.handleApplicationStateChange)
  }

  channels: TTrackChannels = {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    ui: null
  }

  audioChangeThroughCombatHasTakenPlace: boolean

  private readonly previousTracks: Track[] = []

  private readonly addToPreviousTracks = (track: Track) => {
    const { previousTracks } = this
    track.kill(1250, 3000)
    previousTracks.unshift(track)

    if (previousTracks.length > 5) {
      previousTracks.splice(5, 1)
    }
  }

  private readonly getTimeFromPreviousTrack = (mediaId: string) => {
    const track = this.previousTracks.find(track => track.id === mediaId)

    return track ? track.status.pauseTime : 0
  }

  killAllTracks = async (fadeTime = 1500) => {
    const { channels, previousTracks } = this

    try {
      await Promise.all(Object.values(channels).map(track => track?.kill(fadeTime)))
      await Promise.all(previousTracks.map(track => track?.kill(fadeTime)))
    } catch (error) {
      logger.error(error)
    }
  }

  pauseAllTracks = async (fadeTime = 500) => {
    const { channels } = this

    try {
      await Promise.all(
        Object.values(channels).map((track: Track | null) => track?.pause(fadeTime))
      )
    } catch (error) {
      logger.error(error)
    }
  }

  resumeAllTracks = async () => {
    try {
      await Promise.all(
        Object.entries<Track | null>(this.channels).reduce(
          (total: Promise<void>[], [key, track]) => {
            if (track) {
              const audio = this.currentAudioPerChannel[key as keyof TTrackChannels]

              if (track) {
                total.push(
                  track.play({
                    startFrom: track.status.pauseTime,
                    loop: !!(audio && audio.loop),
                    volume: audio?.volume || 1
                  })
                )
              }
            }

            return total
          },
          []
        )
      )
    } catch (error) {
      logger.error(error)
    }
  }

  /**
   * Clears all ongoing fade intervals on tracks
   */
  private readonly stopAllFadeIntervals = () => {
    const { channels, previousTracks } = this

    Object.values(channels).forEach(
      (track: Track | null) => track?._fadeTimeout && clearTimeout(track._fadeTimeout)
    )
    previousTracks.forEach(track => track._fadeTimeout && clearTimeout(track._fadeTimeout))
  }

  private readonly handleApplicationStateChange = (nextAppState: AppStateStatus) => {
    if (!this._game.isRunning) return

    if (nextAppState !== 'active') {
      // Clear intervals when switching out of the game to prevent audio
      // from crashing because the intervals keep trying to change the volume
      // when audio is no longer available.
      this.stopAllFadeIntervals()
    }
  }

  @computed get currentAudioPerChannel() {
    return this.mergeAudio(this.currentAudio)
  }

  @computed get currentAudio() {
    const {
      movement: { location, area },
      scene: { scene, node, underlyingScene }
    } = this._game

    const audio = []

    if (area.audio) {
      audio.push(...area.audio)
    }

    if (location.audio) {
      audio.push(...location.audio)
    }

    if (underlyingScene.audio) {
      audio.push(...underlyingScene.audio)
    }

    if (scene.audio) {
      audio.push(...scene.audio)
    }

    if (node.audio) {
      audio.push(...node.audio)
    }

    return audio
  }

  /**
   * Merges an array of audio data into an object
   */
  public readonly mergeAudio = (audioObjects: EditorAudio[]) =>
    audioObjects.reduce(
      (total: TAudioChannels, audio) => {
        total[audio.track as keyof TAudioChannels] = audio
        return total
      },
      {
        1: null,
        2: null,
        3: null,
        4: null,
        5: null,
        ui: null
      }
    )

  handleAudioChanges = async (audioPerChannel: TAudioChannels = this.currentAudioPerChannel) => {
    if (this.audioChangeThroughCombatHasTakenPlace) {
      this.audioChangeThroughCombatHasTakenPlace = false
    }

    try {
      await Promise.all(
        Object.entries(audioPerChannel).map(([channelKey, audio]) => {
          const key = channelKey as keyof typeof audioPerChannel
          return this.handleTrackChange(key, audio || undefined)
        })
      )
    } catch (error) {
      logger.error({
        error,
        message: 'Error handling audio changes'
      })
    }
  }

  handleTrackChange = async (channelKey: keyof TTrackChannels, audio?: EditorAudio) => {
    const { channels, addToPreviousTracks, getTimeFromPreviousTrack, _game } = this
    const track: Track | null = channels[channelKey]

    // If this audio is already in this channel, simply adjust its settings
    if (track && audio && track.id === audio.media) {
      try {
        const toVolume = typeof audio.volume !== 'undefined' ? audio.volume : 1
        const loop = typeof audio.loop !== 'undefined' ? audio.loop : false

        track.fade(toVolume)
        track.setTrackLooping(loop)
      } catch (error) {
        logger.error(error)
      }
      // There's new audio to be played on this channel.
    } else if (audio) {
      if (track) {
        addToPreviousTracks(track)
      }

      const newSource = audio.media && this._game.getMediaSource('audio', audio.media)

      if (newSource && audio.media) {
        const newTrack = audio.media ? new Track(newSource, audio.media) : null
        channels[channelKey] = newTrack

        if (newTrack && _game._settings.values.soundEnabled) {
          try {
            await newTrack.play({
              startFrom: audio.continueFromPreviousPosition
                ? getTimeFromPreviousTrack(audio.media)
                : 0,
              loop: !!audio.loop,
              volume: audio.volume || 1
            })
          } catch (error) {
            logger.error(error)
          }
        }
      } else {
        channels[channelKey] = null
      }
      // There's no new audio on this channel, pause the track
      // that is currently playing there.
    } else if (track) {
      try {
        addToPreviousTracks(track)
        channels[channelKey] = null
      } catch (error) {
        logger.error(error)
      }
    }
  }

  playUISound = async (id: string, fadeDuration: number = 0, loop: boolean = false) => {
    try {
      if (this.channels.ui) {
        await this.channels.ui.stop(fadeDuration)
      }

      if (!this._game._settings.values.soundEnabled) {
        return
      }

      const source = this._game.getMediaSource('audio', id)

      if (source) {
        this.channels.ui = new Track(source, id)
        this.channels.ui.play({ loop })
      } else {
        logger.error(new Error(`Could not find media with id ${id}`))
      }
    } catch (error) {
      logger.error(error)
    }
  }

  init = () => {
    this.handleAudioChanges()
  }

  private readonly audioChange = reaction(
    () => this.currentAudioPerChannel,
    currentAudioPerChannel => {
      this.handleAudioChanges()
    },
    { name: 'audioChange' }
  )
}
