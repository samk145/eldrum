import type { EditorAudio } from '@actnone/eldrum-editor/dist/types'
import type Game from './game'
import { observable, action, computed } from 'mobx'

export class Ending {
  constructor(private readonly game: Game) {}

  @observable active: boolean = false
  @observable currentPartialIndex: number = 0

  get creditsAudio(): EditorAudio | undefined {
    const { ending } = this.game._content.settings

    return ending?.creditsAudio
      ? {
          media: ending.creditsAudio,
          track: 1,
          loop: false
        }
      : undefined
  }

  private get fallbackAudio(): EditorAudio[] | undefined {
    const { ending } = this.game._content.settings

    if (this.partials[0].audio.length > 0) {
      return this.partials[0].audio
    }

    return ending.partialsAudio
      ? [
          {
            media: ending.partialsAudio,
            track: 1,
            loop: false,
            continueFromPreviousPosition: true
          }
        ]
      : undefined
  }

  @computed get currentPartialAudio(): EditorAudio[] {
    const audioObjects: EditorAudio[] = []

    if (this.fallbackAudio) {
      audioObjects.push(...this.fallbackAudio)
    }

    if (this.currentPartial?.audio.length > 0) {
      audioObjects.push(...this.currentPartial.audio)
    }

    return audioObjects
  }

  @action activate = async () => {
    this.active = true
  }

  @computed get partials() {
    const { ending } = this.game._content.settings

    if (!this.active) {
      return []
    } else {
      return ending.partials.filter(partial => this.game.passesConditions(partial.conditions))
    }
  }

  @computed get currentPartial() {
    const { partials, currentPartialIndex } = this

    return partials.length ? partials[currentPartialIndex] : undefined
  }

  @computed get background() {
    if (!this.active) {
      return null
    }

    return this.currentPartial?.background || this.game._content.settings.ending.background
  }

  @action setCurrentPartialIndex = (index: number) => {
    this.currentPartialIndex = index

    this.handleAudioChanges(this.currentPartialAudio)
  }

  handleAudioChanges = async (audioObjects: EditorAudio[]) => {
    const audioPerChannel = this.game.sound.mergeAudio(audioObjects)

    for (const channelKey in audioPerChannel) {
      const audio = audioPerChannel[channelKey as keyof typeof audioPerChannel]
      const key = channelKey as keyof typeof audioPerChannel

      if (audio) {
        this.game.sound.handleTrackChange(key, audio)
      }
    }
  }
}

export default Ending
