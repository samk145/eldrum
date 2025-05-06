import type Game from './game'
import { observable, reaction, action, computed } from 'mobx'
import { Dimensions } from 'react-native'
import { Marionette, Anim } from './marionette'
import Movement from './movement'
import { delay } from '../helpers/misc'
const deviceSize = Dimensions.get('screen')

export type TModalType = 'bargain' | 'contentInspector' | 'arena' | null
export type TMapMode = 'minimized' | 'maximized'

export class Puppeteer {
  constructor(private readonly _game: Game) {
    this.locked = !this._game._default._fromSaved

    this.marionettes = []
    this.marionettes.push(new Marionette('top'))
    this.marionettes.push(new Marionette('narrative'))
    this.marionettes.push(new Marionette('bottom'))
    this.marionettes.push(new Marionette('combat'))
    this.marionettes.push(new Marionette('background'))
    this.marionettes.push(new Marionette('map'))
    this.marionettes.push(new Marionette('ending'))

    this.changeMarionetteState('ending', [
      new Anim('opacity', 0, 'setValue'),
      new Anim('translateY', deviceSize.height, 'setValue')
    ])
  }

  @observable mapMode: TMapMode = 'minimized'
  @observable modal: TModalType = null
  @observable unseenBackground = false
  @observable locked: boolean
  marionettes: Marionette[]

  @computed get backgroundImage() {
    const { ending } = this._game
    const { location, area } = this._game.movement
    const { scene, node, underlyingScene } = this._game.scene

    let mediaId = null

    if (ending.background) {
      mediaId = ending.background
    } else if (node.background) {
      mediaId = node.background
    } else if (scene.background) {
      mediaId = scene.background
    } else if (underlyingScene.background) {
      mediaId = underlyingScene.background
    } else if (location.background) {
      mediaId = location.background
    } else if (area.background) {
      mediaId = area.background
    }

    return mediaId
  }

  @computed get mapIsAvailable() {
    return this._game.movement.mapIsAvailable
  }

  @computed get ending() {
    return this._game.ending.active
  }

  @computed get cutSceneIsActive() {
    return this._game.scene.cutSceneIsActive
  }

  @action openModal = (identifier: TModalType) => {
    this.modal = identifier
  }

  @action closeModal = () => {
    this.modal = null
  }

  changeMarionetteState = (name: string, stateChanges: Anim[], isAccessible = true) =>
    new Promise<void>((resolve, reject) => {
      const marionette = this.getMarionette(name)

      marionette.updateState(stateChanges, isAccessible, resolve)
    })

  @action setAllMarionettesAccessibility = (value = true) => {
    this.marionettes.forEach(marionette => (marionette.isAccessible = value))
  }

  @action changeMapMode = async (mode: TMapMode) => {
    if (mode === this.mapMode || this._game.combat) {
      return
    }

    if (mode === 'maximized') {
      await this.maximizeMap()
    } else {
      await this.minimizeMap()
    }
  }

  getMarionette = (name: string) => {
    const marionette = this.marionettes.find(m => m.name === name)

    if (!marionette) {
      throw new Error('Could not find the requested marionette')
    }

    return marionette
  }

  gameStart = () => {
    const { changeMarionetteState, cutSceneIsActive } = this

    setTimeout(async () => {
      const animations = [
        changeMarionetteState('top', [
          new Anim('opacity', 1, 'timing', { duration: 750, delay: 6000 })
        ]),
        changeMarionetteState('narrative', [
          new Anim('opacity', 1, 'timing', { duration: 500, delay: 3500 })
        ]),
        changeMarionetteState('background', [
          new Anim('opacity', 0.4, 'timing', { duration: 2500 })
        ])
      ]

      if (!cutSceneIsActive) {
        animations.push(
          changeMarionetteState('bottom', [
            new Anim('opacity', 1, 'timing', { duration: 750, delay: 6000 })
          ])
        )
      }

      if (!this.mapIsAvailable) {
        this.hideMap()
      }

      await Promise.all(animations)
      this.locked = false
    }, 500)
  }

  gameResume = () => {
    const { changeMarionetteState, mapIsAvailable, cutSceneIsActive } = this

    setTimeout(() => {
      if (mapIsAvailable) {
        this.showMap()
      } else {
        this.hideMap()
      }

      changeMarionetteState('top', [new Anim('opacity', 1, 'timing', { duration: 500 })])
      changeMarionetteState('narrative', [new Anim('opacity', 1, 'timing', { duration: 500 })])

      if (cutSceneIsActive) {
        this.cutSceneStart()
      } else {
        changeMarionetteState('bottom', [new Anim('opacity', 1, 'timing', { duration: 500 })])
        changeMarionetteState('background', [new Anim('opacity', 0.4, 'timing', { duration: 500 })])
      }
    }, 250)
  }

  death = async () => {
    const { changeMarionetteState } = this

    this.locked = true

    await Promise.all([
      changeMarionetteState('top', Puppeteer.defaultAnimations.slideReset),
      changeMarionetteState('narrative', Puppeteer.defaultAnimations.slideReset, true),
      changeMarionetteState('map', Puppeteer.defaultAnimations.miniMapSlideDown, false),
      changeMarionetteState('background', [new Anim('opacity', 0.2, 'timing', { duration: 2500 })])
    ])
  }

  cutSceneStart = async () => {
    const { changeMarionetteState, mapIsAvailable } = this

    this.locked = true

    await Promise.all([
      changeMarionetteState(
        'bottom',
        [
          new Anim('opacity', 0, 'timing', { duration: 1000 }),
          new Anim('translateY', deviceSize.height, 'timing', {
            duration: 3000,
            delay: 300
          })
        ],
        false
      ),
      changeMarionetteState('background', [new Anim('opacity', 0.1, 'timing', { duration: 3000 })]),
      mapIsAvailable && changeMarionetteState('map', Puppeteer.defaultAnimations.miniMapSlideDown)
    ])
  }

  cutSceneEnd = async () => {
    const { changeMarionetteState, mapIsAvailable } = this

    await Promise.all([
      changeMarionetteState('bottom', Puppeteer.defaultAnimations.slideReset),
      changeMarionetteState('background', Puppeteer.defaultAnimations.backgroundDimDefault),
      mapIsAvailable && changeMarionetteState('map', Puppeteer.defaultAnimations.miniMapSlideReset)
    ])

    this.locked = false
  }

  combatStart = async () => {
    const { changeMarionetteState, mapIsAvailable, cutSceneIsActive } = this

    this.locked = true

    await Promise.all([
      changeMarionetteState('combat', [new Anim('opacity', 1, 'timing', { duration: 50 })]),
      changeMarionetteState('top', Puppeteer.defaultAnimations.slideUp, false),
      changeMarionetteState('narrative', Puppeteer.defaultAnimations.slideUp, false),
      !cutSceneIsActive &&
        changeMarionetteState('bottom', Puppeteer.defaultAnimations.slideDown, false),
      mapIsAvailable &&
        changeMarionetteState('map', Puppeteer.defaultAnimations.miniMapSlideDown, false)
    ])

    if (!cutSceneIsActive) {
      changeMarionetteState('background', Puppeteer.defaultAnimations.backgroundDimDefault)
    }
  }

  combatEnd = async () => {
    const { changeMarionetteState, mapIsAvailable, cutSceneIsActive } = this

    await delay(125)

    await Promise.all([
      changeMarionetteState('top', Puppeteer.defaultAnimations.slideReset),
      changeMarionetteState('narrative', Puppeteer.defaultAnimations.slideReset),
      changeMarionetteState('combat', [new Anim('opacity', 0, 'setValue')]),
      !cutSceneIsActive && changeMarionetteState('bottom', Puppeteer.defaultAnimations.slideReset),
      !cutSceneIsActive &&
        changeMarionetteState('background', Puppeteer.defaultAnimations.backgroundDimDefault),
      mapIsAvailable && changeMarionetteState('map', Puppeteer.defaultAnimations.miniMapSlideReset)
    ])

    if (!cutSceneIsActive) {
      this.locked = false
    }
  }

  showBackgroundStart = async () => {
    const { changeMarionetteState, mapIsAvailable } = this

    await Promise.all([
      changeMarionetteState(
        'top',
        [new Anim('translateY', -200, 'timing', { duration: 400 })],
        false
      ),
      changeMarionetteState('narrative', Puppeteer.defaultAnimations.slideUp, false),
      changeMarionetteState(
        'bottom',
        [new Anim('translateY', 200, 'timing', { duration: 400 })],
        false
      ),
      changeMarionetteState('background', [new Anim('opacity', 1, 'timing', { duration: 250 })]),
      mapIsAvailable && changeMarionetteState('map', Puppeteer.defaultAnimations.miniMapSlideDown)
    ])
  }

  showBackgroundEnd = async () => {
    const { changeMarionetteState, mapIsAvailable } = this

    await Promise.all([
      changeMarionetteState('top', Puppeteer.defaultAnimations.slideReset),
      changeMarionetteState('narrative', Puppeteer.defaultAnimations.slideReset),
      changeMarionetteState('bottom', Puppeteer.defaultAnimations.slideReset),
      changeMarionetteState('background', Puppeteer.defaultAnimations.backgroundDimDefault),
      mapIsAvailable && changeMarionetteState('map', Puppeteer.defaultAnimations.miniMapSlideReset)
    ])
  }

  backgroundIntroductionStart = async () => {
    const { changeMarionetteState, mapIsAvailable } = this

    this.locked = true

    await Promise.all([
      changeMarionetteState('top', Puppeteer.defaultAnimations.fadeOut, false),
      changeMarionetteState('narrative', Puppeteer.defaultAnimations.fadeOut, false),
      changeMarionetteState('bottom', Puppeteer.defaultAnimations.fadeOut, false),
      changeMarionetteState('background', [
        new Anim('opacity', 1, 'timing', {
          duration: (Puppeteer.backgroundIntroductionDuration / 3) * 2
        })
      ]),
      mapIsAvailable && changeMarionetteState('map', Puppeteer.defaultAnimations.fadeOut, false)
    ])
  }

  backgroundIntroductionEnd = async () => {
    const { changeMarionetteState, mapIsAvailable } = this

    await Promise.all([
      changeMarionetteState('top', Puppeteer.defaultAnimations.fadeIn),
      changeMarionetteState('narrative', Puppeteer.defaultAnimations.fadeIn),
      !this.cutSceneIsActive && changeMarionetteState('bottom', Puppeteer.defaultAnimations.fadeIn),
      changeMarionetteState('background', Puppeteer.defaultAnimations.backgroundDimDefault),
      mapIsAvailable && changeMarionetteState('map', Puppeteer.defaultAnimations.fadeIn)
    ])

    this.locked = false
  }

  maximizeMap = async () => {
    const { changeMarionetteState } = this

    this.locked = true

    await Promise.all([
      changeMarionetteState('top', Puppeteer.defaultAnimations.slideUp, false),
      changeMarionetteState('narrative', Puppeteer.defaultAnimations.slideUp, false),
      changeMarionetteState('bottom', Puppeteer.defaultAnimations.slideDown, false),
      changeMarionetteState('background', [new Anim('opacity', 0.2, 'timing', { duration: 250 })]),
      changeMarionetteState('map', Puppeteer.defaultAnimations.miniMapSlideDown)
    ])

    this.mapMode = 'maximized'

    await delay(250)

    changeMarionetteState('map', [
      new Anim('opacity', 0, 'setValue'),
      new Anim('translateY', 0, 'setValue'),
      new Anim('opacity', 1, 'timing', { duration: 500 })
    ])

    this.locked = false
  }

  minimizeMap = async () => {
    const { changeMarionetteState, mapIsAvailable } = this

    await changeMarionetteState('map', [new Anim('opacity', 0, 'timing', { duration: 250 })])

    await delay(250)

    changeMarionetteState('map', [new Anim('translateY', 400, 'setValue')])

    Promise.all([
      changeMarionetteState('top', Puppeteer.defaultAnimations.slideReset),
      changeMarionetteState('narrative', Puppeteer.defaultAnimations.slideReset),
      changeMarionetteState('bottom', Puppeteer.defaultAnimations.slideReset),
      changeMarionetteState('background', Puppeteer.defaultAnimations.backgroundDimDefault)
    ])

    if (mapIsAvailable) {
      changeMarionetteState('map', Puppeteer.defaultAnimations.miniMapSlideReset)
    }

    this.mapMode = 'minimized'
  }

  showMap = () => {
    this.changeMarionetteState('map', Puppeteer.defaultAnimations.miniMapSlideReset)
  }

  hideMap = () => {
    this.changeMarionetteState('map', Puppeteer.defaultAnimations.miniMapSlideDown, false)
  }

  startEnding = async () => {
    const { changeMarionetteState, mapIsAvailable } = this

    this.locked = true

    await Promise.all([
      changeMarionetteState('top', Puppeteer.defaultAnimations.fadeOut, false),
      changeMarionetteState('narrative', Puppeteer.defaultAnimations.fadeOut, false),
      changeMarionetteState('bottom', Puppeteer.defaultAnimations.fadeOut, false),
      changeMarionetteState('background', [
        new Anim('opacity', 1, 'timing', { duration: Puppeteer.endingBackgroundFadeInDuration })
      ]),
      mapIsAvailable && changeMarionetteState('map', Puppeteer.defaultAnimations.fadeOut, false)
    ])

    await Promise.all([
      changeMarionetteState('ending', [new Anim('translateY', 0, 'setValue')]),
      changeMarionetteState('background', [
        new Anim('opacity', 0.9, 'timing', {
          delay: Puppeteer.endingBackgroundFadeOutDelay,
          duration: Puppeteer.endingBackgroundFadeOutDuration
        })
      ]),
      changeMarionetteState('ending', [
        new Anim('opacity', 1, 'timing', {
          delay: Puppeteer.endingIntroductionDelay,
          duration: Puppeteer.endingIntroductionDuration
        })
      ])
    ])

    this._game._ui.setAccessibilityFocus('ending')
  }

  static endingBackgroundFadeInDuration = 3000
  static endingBackgroundFadeOutDelay = 1000
  static endingBackgroundFadeOutDuration = 750
  static endingIntroductionDelay = 500
  static endingIntroductionDuration = 2000

  onMapAvailabilityChange = reaction(
    () => this.mapIsAvailable,
    mapIsAvailable => {
      const { pathEncounter } = this._game.movement

      if (mapIsAvailable) {
        this.showMap()
      } else if (!mapIsAvailable && pathEncounter && this.mapMode === 'maximized') {
        setTimeout(this.hideMap, Movement.travelDuration / 2 + Movement.pathEncounterHaltDuration)
      } else {
        this.hideMap()
      }
    },
    { name: 'onMapAvailabilityChange' }
  )

  onEndGameIsReached = reaction(
    () => this.ending,
    ending => {
      this.startEnding()
    },
    { name: 'onEndGameIsReached' }
  )

  onBackgroundChange = reaction(
    () => this.backgroundImage,
    async backgroundImage => {
      const { _game, ending } = this

      if (
        backgroundImage &&
        !_game.statistics.getRecord('seenMedia', backgroundImage) &&
        !_game.movement.route &&
        !ending
      ) {
        _game.statistics.record('seenMedia', backgroundImage)

        if (!_game.inspector?.bot.running) {
          this.unseenBackground = true
          await this.backgroundIntroductionStart()
          await this.backgroundIntroductionEnd()
          this.unseenBackground = false

          if (this.cutSceneIsActive) {
            this.cutSceneStart()
          }
        }
      }
    },
    { name: 'onBackgroundChange' }
  )

  movePuppeteerToCutScene = reaction(
    () => this.cutSceneIsActive,
    cutSceneIsActive => {
      if (cutSceneIsActive) {
        this.cutSceneStart()
      } else if (!cutSceneIsActive && !this.ending) {
        this.cutSceneEnd()
      }
    },
    { name: 'movePuppeteerToCutScene' }
  )

  modalChange = reaction(
    () => this.modal,
    modal => {
      if (modal) {
        this.getMarionette('narrative').isAccessible = false
      } else {
        this.getMarionette('narrative').isAccessible = true
      }
    },
    { name: 'modalChange' }
  )

  readerChange = reaction(
    () => this._game.reader,
    reader => {
      if (reader) {
        this.getMarionette('bottom').isAccessible = false
      } else {
        this.getMarionette('bottom').isAccessible = true
      }
    },
    { name: 'readerChange' }
  )

  static backgroundFadeDuration = 3000
  static backgroundIntroductionDuration = 3000

  static defaultAnimations = {
    slideReset: [
      new Anim('opacity', 1, 'setValue'),
      new Anim('translateY', 0, 'spring', { bounciness: 2, velocity: 4 })
    ],
    slideDown: [
      new Anim('opacity', 1, 'setValue'),
      new Anim('translateY', deviceSize.height, 'timing', { duration: 400 })
    ],
    slideUp: [
      new Anim('opacity', 1, 'setValue'),
      new Anim('translateY', -deviceSize.height, 'timing', { duration: 400 })
    ],
    miniMapSlideDown: [
      new Anim('opacity', 0, 'timing', { duration: 400 }),
      new Anim('translateY', 400, 'timing', { duration: 400 })
    ],
    miniMapSlideReset: [
      new Anim('opacity', 1, 'spring', { bounciness: 2, velocity: 4 }),
      new Anim('translateY', 0, 'spring', { bounciness: 2, velocity: 4 })
    ],
    fadeOut: [
      new Anim('translateY', 0, 'setValue'),
      new Anim('opacity', 0, 'timing', { duration: 500 })
    ],
    fadeIn: [
      new Anim('translateY', 0, 'setValue'),
      new Anim('opacity', 1, 'timing', { duration: 500 })
    ],
    backgroundDimDefault: [new Anim('opacity', 0.4, 'timing', { duration: 500 })]
  }
}

export default Puppeteer
