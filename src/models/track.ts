import type { AVPlaybackStatus, AVPlaybackStatusToSet, AVPlaybackSource } from 'expo-av'
import { Audio } from 'expo-av'
import { logger } from '../helpers/logger'
import { clampBetween, delay as delayFn } from '../helpers/misc'

enum ELoadStatus {
  LOADING = 'loading',
  LOADED = 'loaded',
  UNLOADED = 'unloaded'
}

type TTrackStatus = {
  loadStatus: ELoadStatus | undefined
  shouldLoop: boolean
  pauseTime: number
  fadeToVolume: number
  volume: number
  killed: boolean
}

export class Track {
  constructor(
    private readonly source: AVPlaybackSource,
    public id?: string
  ) {}

  private readonly _sound = new Audio.Sound()

  _fadeTimeout: ReturnType<typeof setTimeout> | null = null

  status: TTrackStatus = {
    loadStatus: undefined,
    shouldLoop: false,
    pauseTime: 0,
    fadeToVolume: 1,
    volume: 1,
    killed: false
  }

  unload = async () => {
    const { _sound, status } = this

    status.loadStatus = ELoadStatus.UNLOADED
    await _sound.unloadAsync()
  }

  load = async (AVPlaybackStatus?: AVPlaybackStatusToSet) => {
    const { _sound, status, source } = this

    if (status.loadStatus === ELoadStatus.LOADING) return

    _sound.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate)
    status.loadStatus = ELoadStatus.LOADING
    await _sound.loadAsync(source, AVPlaybackStatus)
    status.loadStatus = ELoadStatus.LOADED
  }

  kill = async (fadeTime = 1500, killCheckTimer = 1500) => {
    const { _fadeTimeout, status, pause } = this
    status.killed = true

    if (_fadeTimeout) {
      clearTimeout(_fadeTimeout)
    }

    await pause(fadeTime)
    await delayFn(killCheckTimer)

    if (status.loadStatus === ELoadStatus.LOADED) {
      await pause(fadeTime)
    }
  }

  setVolume = async (volume: number) => {
    const { _sound, status } = this

    if (status.loadStatus !== ELoadStatus.LOADED) return

    const clampedVolume = clampBetween(volume, 0, 1)

    await _sound.setVolumeAsync(clampedVolume)
    status.volume = volume
  }

  play = async ({
    loop = true,
    startFrom = 0,
    volume = 1
  }: {
    loop?: boolean
    startFrom?: number
    volume?: number
  } = {}) => {
    const { _sound, fade, status } = this

    const shouldFadeIn = !!startFrom
    status.volume = shouldFadeIn ? 0 : volume
    const initialStatus: AVPlaybackStatusToSet = {
      volume: status.volume,
      positionMillis: startFrom
    }

    if (status.loadStatus !== ELoadStatus.LOADED) {
      await this.load(initialStatus)
    } else {
      await _sound.setStatusAsync(initialStatus)
    }

    this.status.shouldLoop = loop

    await _sound.playAsync()

    if (shouldFadeIn) {
      await fade(volume)
    }
  }

  pause = async (fadeTime = 1500) => {
    const { _sound, status, fade, unload } = this

    if (status.loadStatus !== ELoadStatus.LOADED) return

    const playbackStatus = await _sound.getStatusAsync()

    if (!playbackStatus.isLoaded) {
      throw new Error(playbackStatus.error)
    }

    const { positionMillis } = playbackStatus
    status.pauseTime = positionMillis || 0
    await fade(0, fadeTime)
    await unload()
  }

  stop = async (fadeTime = 1500) => {
    const { fade, unload, status, _sound } = this

    if (status.loadStatus !== ELoadStatus.LOADED) return

    const playbackStatus = await _sound.getStatusAsync()

    if (!playbackStatus.isLoaded) {
      throw new Error(playbackStatus.error)
    }

    const { isPlaying } = playbackStatus

    if (isPlaying) {
      await fade(0, fadeTime)
    }

    await unload()
  }

  /**
   * Fades the track to a given volume. If another fade is called when
   * a fade is ongoing, the latest called fade will take precedence.
   *
   * @param {number} toVolume - Number between 0 and 1
   */
  fade = (toVolume: number, time: number = 1500) =>
    new Promise<void>((resolve, reject) => {
      const { status, _fadeTimeout, setVolume } = this

      if (status.volume === toVolume) return resolve()

      status.fadeToVolume = toVolume

      let currVolume = Math.floor(status.volume * 10)

      const loop = async () => {
        const start = Math.floor(status.volume * 10)
        const end = status.fadeToVolume * 10

        if (currVolume !== end) {
          start < end ? currVolume++ : currVolume--
          await setVolume(currVolume / 10)
          this._fadeTimeout = setTimeout(loop, time / 10)
        } else {
          if (_fadeTimeout) {
            clearTimeout(_fadeTimeout)
          }

          this._fadeTimeout = null
          resolve()
        }
      }

      this._fadeTimeout = setTimeout(loop, 5)
    })

  setTrackLooping = (shouldLoop: boolean) => {
    this.status.shouldLoop = shouldLoop
  }

  isReplaying: boolean = false

  private readonly _onPlaybackStatusUpdate = async (playbackStatus: AVPlaybackStatus) => {
    if (!playbackStatus.isLoaded) {
      if (playbackStatus.error) {
        logger.info('Error', playbackStatus.error)
      }

      return
    }

    const { isPlaying, durationMillis, positionMillis, didJustFinish } = playbackStatus

    try {
      if (!this.status.shouldLoop) {
        if (didJustFinish) {
          await this.unload()
        }

        return
      }

      if (this.isReplaying) return

      this.isReplaying = true

      // ! This is a safety measure to loop in case durationMillis correct value hasn't loaded yet
      if (didJustFinish) {
        await this._sound.replayAsync()
      } else if (
        isPlaying &&
        durationMillis &&
        durationMillis > 1 &&
        durationMillis - positionMillis < 1500
      ) {
        await this._sound.replayAsync()
      }

      this.isReplaying = false
    } catch (err) {
      logger.error(err)
    }
  }
}

export default Track
