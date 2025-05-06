import { observable, computed, action, reaction, when, type IReactionDisposer } from 'mobx'

import type {
  EditorScene,
  EditorOptionOutcome,
  EditorOptionOutcomeEvent
} from '@actnone/eldrum-editor/dist/types'
import type { TConditions } from '../../helpers/conditions'
import type Game from '../game'
import type Option from './option'

import { t } from '../../i18n'
import { logger } from '../../helpers/logger'
import { analytics } from '../../helpers/analytics'
import { randomFromList, shortenObjectId } from '../../helpers/misc'
import { SceneHistory } from './history'
import Node from './node'

type TNarrativeOverrideType = 'replace' | 'prepend' | 'append'
type TNarrativeOverride = { translationKey: string; type: TNarrativeOverrideType }

export class Scene {
  constructor(private readonly _game: Game) {
    if (_game._default._fromSaved) {
      this.history = this._game._default.scene.history.map(
        saveHistory => new SceneHistory(saveHistory)
      )
      this.nodeId = this._game._default.scene.nodeId
      this.previousNodeId = this._game._default.scene.previousNodeId
      this.stateEncounter = this._game._default.scene.stateEncounter
    }

    // Spawn NPCs and narrative. This is done using "when" because the
    // has not yet been computed at this point which would cause a fatal crash.
    // and when is more suitable than reaction since we only want to do this
    // once when loading the game or creating a new one.
    when(
      () => !!this.scene,
      () => {
        this.sceneId = this.scene._id

        if (_game._default._fromSaved) {
          this._game.actors.spawn(this._game._default.scene.npcs)
        } else {
          this._game.actors.spawn()
          this.addNodeNarrative()
        }
      }
    )
  }

  @observable sceneId: string | null = null // Only used in order for node-reaction to be able to react to scene changes
  @observable nodeId: string | null = null // The current node the player is on in the scene
  @observable stateEncounter: string | null = null // The scene ID of the current state encounter
  @observable history: SceneHistory[] = []
  narrativeOverride: TNarrativeOverride | null = null
  private _deathNarrativeTranslationKeys: string[] = []
  previousNodeId: string | null = null
  nodeChange?: IReactionDisposer
  captureAnalytics?: IReactionDisposer
  captureNodeAnalytics?: IReactionDisposer
  logBreadcrumb?: IReactionDisposer

  @computed get type() {
    const { stateEncounter, _game } = this

    if (stateEncounter) {
      return 'stateEncounter'
    }

    if (_game.movement.pathEncounterId) {
      return 'pathEncounter'
    }

    return 'location'
  }

  @computed get scene(): EditorScene {
    const { movement, getEntity } = this._game

    let scene

    switch (this.type) {
      case 'location':
        scene = getEntity('scenes', movement.state.scene[0])
        break
      case 'pathEncounter':
        if (movement.pathEncounter) {
          scene = getEntity('scenes', movement.pathEncounter.scene[0])
        }
        break
      case 'stateEncounter':
        if (this.stateEncounter) {
          scene = getEntity('scenes', this.stateEncounter)
        }
        break
    }

    if (!scene) {
      throw new Error('Failed to compute scene')
    }

    return scene
  }

  @computed get underlyingScene(): EditorScene {
    const { movement, getEntity } = this._game

    return getEntity('scenes', movement.state.scene[0])
  }

  @computed get node() {
    const {
      nodeId,
      scene,
      type,
      _game: { movement }
    } = this
    let nid: undefined | string | null = nodeId

    // The node does not exist in the current scene, which means
    // that the player has left the scene (i.e. traveled or entered an encounter)
    if (!nid) {
      if (type === 'location' && movement.state.scene.length > 1) {
        nid = movement.state.scene[1]
      } else if (
        type === 'pathEncounter' &&
        movement.pathEncounter &&
        movement.pathEncounter.scene.length > 1
      ) {
        nid = movement.pathEncounter.scene[1]
      }
    }

    const node = scene.nodes.find(n => n._id === nid) || scene.nodes[0]

    return new Node(this._game, node)
  }

  @computed get cutSceneIsActive() {
    const { scene, node } = this

    return !!(scene.cutScene || node.cutScene)
  }

  get deathNarrativeTranslationKey(): string {
    return randomFromList(this._deathNarrativeTranslationKeys) || t('DEATH-FALLBACK_NARRATIVE')
  }

  setDeathNarrativeTranslationKeys = (narrativeKeys: string[]) => {
    this._deathNarrativeTranslationKeys = narrativeKeys
  }

  resetDeathNarrativeTranslationKeys() {
    this._deathNarrativeTranslationKeys = []
  }

  /**
   * Action: Execute option
   */
  @action executeOption = async (option: Option) => {
    const translationContext = `${shortenObjectId(this.scene._id)}-NODE-${shortenObjectId(this.node._id)}-OPT-${shortenObjectId(option._id)}`

    // Pre-outcome action execution must happen before any state changes
    // because the action could be triggering a save.
    if (option.actions?.length) {
      await this._game.executeActions(option.actions, translationContext)
    }

    this._game.statistics.record('usedOptions', option._id)

    const outcome = this.getOptionOutcome(option.outcomes, true)

    if (outcome) {
      await this.executeOutcome(outcome, translationContext)
    } else {
      await this.executeOutcome(option.outcomes[0], translationContext)
      logger.info(
        `No outcome passes all conditions. Defaulting to first outcome: ${option.outcomes[0]._id} in scene ${this.scene._id}`
      )
    }

    this._game.questLog.evaluateQuests()
  }

  /**
   * Action: Execute outcome
   */
  @action private readonly executeOutcome = async (
    outcome: EditorOptionOutcome,
    translationContext: string
  ) => {
    const { statistics, sound } = this._game

    if (outcome.actions?.length) {
      await this._game.executeActions(
        outcome.actions,
        `${translationContext}-OUT-${shortenObjectId(outcome._id)}`
      )
    }

    if (outcome.audio) {
      sound.handleTrackChange(outcome.audio.track, outcome.audio)
    }

    if (!this._game.character.alive) {
      return
    }

    if (outcome.event.type) {
      switch (outcome.event.type) {
        case 'node':
          this.changeNodeId(outcome.event.parameters[0])
          break
        case 'narrative':
          this.executeNarrativeEvent(outcome)
          break
        case 'goToPreviousNode':
          if (this.previousNodeId) {
            this.changeNodeId(this.previousNodeId)
          } else {
            logger.warn('No previous node id found')
          }
          break
        default:
          this.executeSpecialEvent(outcome.event)
          break
      }
    }

    statistics.record('seenOptionOutcomes', outcome._id)
  }

  @action changeNodeId = (
    nodeId: string,
    options: { recordPreviousNode?: boolean; keepPrevious?: boolean } = {
      recordPreviousNode: true,
      keepPrevious: true
    }
  ) => {
    if (options.recordPreviousNode) {
      this._game.statistics.record('seenNodes', this.node._id)
    }

    if (options.keepPrevious) {
      this.previousNodeId = this.node._id
    }

    this.nodeId = nodeId
  }

  @action resetNodeId = () => {
    this.previousNodeId = null
    this.nodeId = null
  }

  /**
   * Action: Execute Narrative event
   */
  @action executeNarrativeEvent = (outcome: EditorOptionOutcome) => {
    const { sound, getUsageValueIndex } = this._game
    const narrativeIndex = getUsageValueIndex('outcome', outcome)
    const optionId = this._game.statistics.getRecord('lastUsedOption') || ''
    const keyPrefix = `${shortenObjectId(this.scene._id)}-NODE-${shortenObjectId(this.node._id)}`
    const key = `${keyPrefix}-OPT-${shortenObjectId(optionId)}-OUT-${shortenObjectId(outcome._id)}-NARR-${narrativeIndex}`

    if (key) {
      this.addNarrative(key)
    }
    if (sound.audioChangeThroughCombatHasTakenPlace) {
      sound.handleAudioChanges()
    }
  }

  /**
   * Action: Execute Special event
   */
  @action executeSpecialEvent = (event: EditorOptionOutcomeEvent) => {
    switch (event.type) {
      case 'endGame':
        this._game.ending.activate()
        break
      case 'continueOnPath':
        if (this._game.movement.pendingLocationId) {
          this._game.saveCurrentState(['pathEncounter', 'path'])
          this._game.movement.goToLocation(this._game.movement.pendingLocationId)
          this.resetSceneVars()
        }
        break
      case 'goBackOnPath':
        this._game.saveCurrentState(['scene', 'node', 'pathEncounter'])
        this.resetSceneVars()
        this._game.movement.resetPathVars()
        break
      case 'startEncounter':
        {
          const [sceneId, nodeId] = event.parameters[0]
          this._game.saveCurrentState(['scene', 'node'])
          this.stateEncounter = sceneId

          if (nodeId) {
            this.changeNodeId(nodeId, { recordPreviousNode: false, keepPrevious: false })
          }
        }

        break
      case 'endEncounter':
        this._game.saveCurrentState(['scene', 'node'])
        this.resetSceneVars()
        break
      case 'travelToLocation': {
        const [locationId, anyRoute] = event.parameters
        this._game.movement.travelToLocation(locationId, anyRoute)
        break
      }
      case 'goToLocation':
        {
          const [locationId] = event.parameters
          this._game.movement.goToLocation(locationId)
        }
        break
      default:
        logger.info(`Warning: An event is missing a matching type ${event.type}`)
    }
  }

  @action addNodeNarrative = () => {
    const narrativeIndex = this._game.getUsageValueIndex('node', this.node)
    const key = `${shortenObjectId(this.scene._id)}-NODE-${shortenObjectId(this.node._id)}-NARR-${narrativeIndex}`

    this.addNarrative(key)
  }

  @action addNarrative = (narrativeTranslationKey: string) => {
    const newNarrativeTranslationKeys = this.narrativeOverride
      ? Scene.mergeWithNarrativeOverride([narrativeTranslationKey], this.narrativeOverride)
      : [narrativeTranslationKey]

    while (this.history.length > Scene.narrativeItemsLimit - 1) {
      this.history.shift()
    }

    this.history.push(
      new SceneHistory({
        narrativeTranslationKeys: newNarrativeTranslationKeys
      })
    )
    this.removeNarrativeOverride()
  }

  addNarrativeOverride = (narrativeTranslationKey: string, type: TNarrativeOverrideType) => {
    this.narrativeOverride = {
      translationKey: narrativeTranslationKey,
      type: type || 'replace'
    }
  }

  removeNarrativeOverride = () => {
    this.narrativeOverride = null
  }

  static mergeWithNarrativeOverride = (
    narrativeTranslationKeys: string[],
    override: TNarrativeOverride
  ): string[] => {
    switch (override.type) {
      case 'prepend':
        return [override.translationKey, ...narrativeTranslationKeys]
      case 'append':
        return [...narrativeTranslationKeys, override.translationKey]
      default:
        return [override.translationKey]
    }
  }

  @action resetSceneVars = () => {
    this.resetNodeId()
    this.stateEncounter = null
  }

  autoSave = (conditions: TConditions) => {
    if (this._game.passesConditions(conditions)) {
      this._game._play.autoSave()
    }
  }

  getOptionOutcome = (outcomes: EditorOptionOutcome[], triggerNotifications: boolean = false) => {
    return this._game.getEntityByConditions(outcomes, undefined, triggerNotifications)
  }

  mount() {
    this.nodeChange = reaction(
      () => this.node,
      node => {
        if (node) {
          const { addNodeNarrative, autoSave, scene } = this

          addNodeNarrative()

          // This parts acts like a scene reaction. The reason it's here and
          // not in a scene-triggered reaction is because the triggering order
          // of reactions can not be trusted, which caused an issue where
          // autosaves on scene level were triggered before the narrative had
          // been added, as well as the other way around, i.e. that node autosaves
          // were triggered before NPCs had been spawned into the scene.
          if (scene._id !== this.sceneId) {
            this._game.actors.spawn()

            if (scene.autoSave && scene.autoSave.save) {
              autoSave(scene.autoSave.conditions)
            }

            this.sceneId = scene._id
            logger.debug('SCENE CHANGE:', this.scene.name)
          }

          if (node.autoSave && node.autoSave.save) {
            autoSave(node.autoSave.conditions)
          }
        }
      },
      { name: 'nodeChange' }
    )

    this.captureNodeAnalytics = reaction(
      () => this.node,
      node => {
        if (node) {
          analytics.addUserProperty({
            node: node._id
          })
        }
      },
      { name: 'sceneCaptureNodeAnalytics', fireImmediately: true }
    )

    this.captureAnalytics = reaction(
      () => this.scene,
      scene => {
        const { movement } = this._game

        if (scene && !movement.traveling) {
          analytics.addUserProperty({
            area: movement.area.name,
            location: movement.location.name,
            node: this.node._id
          })

          analytics.screen('in-game', {
            scene: this.scene.name
          })
        }
      },
      { name: 'sceneCaptureAnalytics', fireImmediately: true }
    )

    this.logBreadcrumb = reaction(
      () => this.scene,
      scene => {
        logger.sentry?.addBreadcrumb({
          category: 'scene.change',
          data: {
            name: scene.name,
            id: scene._id
          }
        })
      },
      { name: 'sceneLogBreadcrumb' }
    )
  }

  unmount() {
    this.nodeChange?.()
    this.captureNodeAnalytics?.()
    this.captureAnalytics?.()
    this.logBreadcrumb?.()

    analytics.removeUserProperty('area')
    analytics.removeUserProperty('location')
    analytics.removeUserProperty('scene')
    analytics.removeUserProperty('node')
  }

  static narrativeItemsLimit = 5
}

export default Scene
