import type {
  EditorAction,
  EditorOptionOutcome,
  EditorGameCondition,
  EditorScripture,
  EditorPath
} from '@actnone/eldrum-editor/dist/types'
import type { Stores } from '../stores/index'
import type Option from './scene/option'
import type Node from './scene/node'
import type { TStringOperator } from '../helpers/misc'
import type { SaveData } from './database/schemas/save/save-data'
import type { TCombatOptions, TActionParticipants, TActionParticipant } from './combat/combat'
import type {
  TConditionsResult,
  TVerboseConditionsResult,
  TGameConditionFns,
  TConditions
} from '../helpers/conditions'
import type ContentStore from '../stores/content'
import type { Actors } from './actors'
import type Bargain from './bargain'
import type { Character } from './character/character'
import type { Npc } from './character/npc'

import { observable, action, when } from 'mobx'
import { t } from '../i18n'
import { logger } from '../helpers/logger'
import { evaluateUsingStringOperator, delay, Conditions, camelCaseToConstCase } from '../helpers'
import { SaveType } from './database/schemas/save'
import { Arena } from './arena/arena'
import { QuestLog } from './quests'
import { Combat } from './combat/combat'
import { Ending } from './ending'
import { Factions } from './factions'
import { Inspector } from './inspector/inspector'
import { Movement } from './movement'
import { Notifications } from './notifications'
import { Puppeteer } from './puppeteer'
import { Scene } from './scene'
import { Sound } from './sound'
import { Statistics } from './statistics'
import { Variables } from './variables'

export type TEngageInCombatParams<T extends TActionParticipant = TActionParticipant> = {
  npcParticipants: TActionParticipants<T>
  options?: TCombatOptions
}

export type TGameConstructorParams = [
  Pick<Stores, 'achievements' | 'content' | 'ui' | 'settings' | 'play'>,
  SaveData,
  boolean?
]

export interface IGameGenerics {
  Character: Character
  Npc: Npc
  Combat: Combat
  SaveData: SaveData
}

export abstract class Game<G extends IGameGenerics = IGameGenerics> {
  constructor(
    stores: TGameConstructorParams[0],
    defaultValues: G['SaveData'],
    fromSaved: TGameConstructorParams[2] = false
  ) {
    this._id = defaultValues._id
    this._default = {
      ...JSON.parse(JSON.stringify(defaultValues)),
      _fromSaved: fromSaved
    }

    this.startDate = defaultValues.startDate || null
    this._content = stores.content.data
    this.getEntity = stores.content.getEntity
    this.getEntities = stores.content.getEntities
    this.getMediaSource = stores.content.getMediaSource
    this._ui = stores.ui
    this._play = stores.play
    this._settings = stores.settings
    this._achievements = stores.achievements
    this.arena = new Arena(this)

    when(
      () => !this.character.alive,
      () => this.gameOver()
    )

    if (stores.settings.config.enableContentInspector) {
      this.inspector = new Inspector(this, this._default.inspector)
    }
  }

  _id: string
  _default: G['SaveData'] & { _fromSaved: boolean }
  _content
  _ui
  _settings
  _achievements
  _play
  getEntity: ContentStore['getEntity']
  getEntities: ContentStore['getEntities']
  getMediaSource: ContentStore['getMediaSource']

  @observable isRunning: boolean = false
  @observable combat: G['Combat'] | null = null
  @observable bargain: Bargain | null = null
  @observable reader: EditorScripture | null = null

  startDate: number | null = null
  @observable movement: Movement = new Movement(this)
  abstract character: G['Character']
  @observable puppeteer: Puppeteer = new Puppeteer(this)
  @observable scene: Scene = new Scene(this)
  @observable questLog: QuestLog = new QuestLog(this)
  @observable ending: Ending = new Ending(this)
  @observable notifications: Notifications = new Notifications(this)
  @observable variables: Variables = new Variables(this)
  @observable sound: Sound = new Sound(this)
  @observable statistics: Statistics = new Statistics(this)
  @observable factions: Factions = new Factions(this)
  arena: Arena<{ Game: Game; Npc: G['Npc'] }>
  abstract actors: Actors

  inspector?: Inspector

  /**
   * Action: Execute actions
   */
  @action executeActions = async (actions: EditorAction[], translationContext: string) => {
    this.scene.resetDeathNarrativeTranslationKeys()

    for (let index = 0; index < actions.length; index++) {
      const action = actions[index]
      // Use await for these special NPC interactions since we don't
      // want the option outcome to be triggered until after the interaction
      // is over.
      switch (action.type) {
        case 'saveGame':
          await this._play.saveGame(action.parameters[0] as SaveType)
          break
        case 'bargainWithNpc':
          {
            const [npcId] = action.parameters
            await this.bargainWithNpc(npcId)
          }
          break
        case 'engageInCombat':
          {
            const [
              npcParticipants,
              customTurnOrder,
              deathNarratives,
              playerHealthLimit,
              customAudio,
              isConfinedSpace
            ] = action.parameters

            if (deathNarratives?.length) {
              this.scene.setDeathNarrativeTranslationKeys(
                deathNarratives.map((_, i) => `${translationContext}-DEATH_NARRATIVE-${i}`)
              )
            }

            const parsedNpcParticipants = npcParticipants.map(participant => {
              const npc = this.actors.getNpc(participant.npc)

              if (!npc) {
                throw new Error(`engageInCombat: can't find NPC ${participant.npc} in scene.`)
              }

              return {
                npc,
                startingRow:
                  typeof participant.startingRow === 'string'
                    ? Number(participant.startingRow)
                    : participant.startingRow,
                healthLimit: participant.healthLimit
              }
            }) as unknown as TActionParticipants

            const combatOptions = {
              playerHealthLimit,
              customTurnOrder: customTurnOrder?.length ? customTurnOrder : undefined,
              customAudio,
              isConfinedSpace
            }

            await this.engageInCombat({
              npcParticipants: parsedNpcParticipants,
              options: combatOptions
            })
          }
          break
        default:
          this.executeAction(action, translationContext)
      }
    }
  }

  /**
   * Action: Execute action
   */
  @action private readonly executeAction = (action: EditorAction, translationContext: string) => {
    const { character, questLog, scene } = this
    const { type, parameters } = action

    switch (type) {
      // Character
      case 'pickUpItem':
        {
          const [id, quantity, notify, equip] = parameters
          const ids = Array(Number(quantity || 1)).fill(id)
          character.inventory.pickUpItem(ids, { notify, equip })
        }
        break
      case 'pickUpLoot':
        {
          const [id, equip] = parameters
          const loot = character.inventory.calculateLoot(id)
          character.inventory.pickUpLoot(loot, { notify: true, equip })
        }
        break
      case 'removeItem':
        {
          const [id, quantity, notify] = parameters
          const ids = Array(Number(quantity || 1)).fill(id)
          character.inventory.removeItemById(ids, { notify })
        }
        break
      case 'removeAllItems':
        {
          const [notify] = parameters
          character.inventory.removeAllItems({ notify })
        }
        break
      case 'consumeItem':
        character.inventory.consumeItem(parameters[0])
        break
      case 'changeStat':
        {
          const [stat, value, notify] = parameters
          character.changeStat(stat, value, notify)
        }
        break

      case 'changeStatRandom':
        {
          const [stat, fromValue, toValue] = parameters
          const value = Math.floor(Math.random() * Number(toValue)) + Number(fromValue)
          character.changeStat(stat, value)
        }
        break
      case 'gainExperience':
        character.gainExperience(parameters[0])
        break
      case 'loseExperience':
        character.loseExperience(parameters[0], parameters[1])
        break
      case 'setLevel':
        character.setLevel(parameters[0], parameters[1])
        break
      case 'gainExperienceToReachNextLevel':
        character.gainExperienceToReachNextLevel()
        break
      case 'changeHealth':
        {
          const [value, deathNarratives] = parameters

          if (deathNarratives?.length) {
            this.scene.setDeathNarrativeTranslationKeys(
              deathNarratives.map((_, i) => `${translationContext}-DEATH_NARRATIVE-${i}`)
            )
          }

          character.changeHealth(Number(value), true)
        }
        break
      case 'changeHealthLimited':
        {
          const [value, resultLimit] = parameters
          character.changeHealth(Number(value), true, isNaN(resultLimit) ? 0 : resultLimit)
        }
        break
      case 'gainFullHealth':
        {
          const value = character.maxHealth - character.health
          character.changeHealth(value, true)
        }
        break
      case 'addEffect':
        {
          const [effectId] = parameters
          character.effects.addEffect(effectId)
        }
        break
      case 'removeEffect':
        {
          const [effectId] = parameters
          character.effects.removeEffectsById(effectId)
        }
        break

      // Quests
      case 'initiateQuest':
        questLog.initiateQuest(parameters[0])
        break
      case 'removeQuest':
        questLog.removeQuest(parameters[0])
        break
      case 'completeQuest':
        questLog.completeQuest(parameters[0])
        break
      case 'completeQuestObjective':
        {
          const [questId, objectiveId] = parameters[0]
          questLog.completeObjective(questId, objectiveId)
        }
        break
      case 'activateQuestObjectiveUpdate':
        {
          const [questId, objectiveId, updateId] = parameters[0]
          questLog.activateQuestObjectiveUpdate(questId, objectiveId, updateId)
        }
        break

      // NPC
      case 'changeHealthNpc':
        {
          const [id, value] = parameters
          const npc = this.actors.getNpc(id)

          if (npc) {
            npc.changeHealth(Number(value), true, 1)
          }
        }
        break
      case 'changeAttributeNpc':
        {
          const [id, stat, value] = parameters
          const npc = this.actors.getNpc(id)

          if (npc) {
            npc.changeAttribute(stat, Number(value), true)
          }
        }
        break
      case 'attackNpcMelee':
        {
          const [npcId, damageMultiplier = 1] = parameters
          const npc = this.actors.getNpc(npcId)

          if (npc) {
            const attack = character.attacks.primaryMeleeAttack
            const damage = attack ? attack.getDamageRng() * damageMultiplier : 1 * damageMultiplier
            const result = npc.calculateDamageInfliction(damage)

            npc.changeHealth(-result, true, 1)
          }
        }
        break
      case 'attackNpcRanged':
        {
          const [npcId, damageMultiplier] = parameters
          const npc = this.actors.getNpc(npcId)
          const attack = character.attacks.primaryRangedAttack

          if (npc && attack) {
            const damage = damageMultiplier
              ? attack.getDamageRng() * damageMultiplier
              : attack.getDamageRng()
            const result = npc.calculateDamageInfliction(damage)

            if (attack.usesAmmunition) {
              attack.disposeAmmunition()
            }

            npc.changeHealth(-result, true, 1)
          }
        }
        break

      case 'addEffectNpc':
        {
          const [npcId, effectId] = parameters
          const npc = this.actors.getNpc(npcId)

          if (npc) {
            npc.effects.addEffect(effectId)
          }
        }
        break
      case 'removeEffectNpc':
        {
          const [npcId, effectId] = parameters
          const npc = this.actors.getNpc(npcId)

          if (npc) {
            npc.effects.removeEffectsById(effectId)
          }
        }
        break
      // Scenes
      case 'overrideNarrative': {
        scene.addNarrativeOverride(`${translationContext}-NARRATIVE_OVERRIDE`, parameters[1])
        break
      }

      // Arena
      case 'openArena': {
        this.puppeteer.openModal('arena')
        break
      }
      case 'resetArenaChallenges': {
        const [pristineOnly] = parameters

        if (pristineOnly) {
          this.arena.resetPristineChallenges()
        } else {
          this.arena.resetChallenges()
        }

        break
      }

      // Global
      case 'setStringVariable':
      case 'setNumberVariable':
      case 'setBooleanVariable':
        {
          const [variableId, value] = parameters
          this.variables.setValue(variableId, value)
        }
        break
      case 'changeNumberVariable':
        {
          const [variableId, value] = parameters
          this.variables.changeNumericVariable(variableId, value)
        }
        break

      // Misc
      case 'displayNotification': {
        if (!this.combat) {
          this.notifications.create(t(`${translationContext}-NOTIFICATION`))
        }
        break
      }
      case 'openReader':
        this.openReader(parameters[0])
        break

      default:
        logger.warn(`Trying to execute action ${type}, but there is no such action.`)
        break
    }
  }

  abstract combatFactory(
    params: TEngageInCombatParams<TActionParticipant<G['Npc']>>,
    onEnd: (playerWon: boolean) => void
  ): G['Combat']

  abstract bargainFactory: (npcId: string, onEnd: () => void) => Bargain

  /**
   * Action: Engage NPC(s) in combat
   */
  @action async engageInCombat(
    params: TEngageInCombatParams<TActionParticipant<G['Npc']>>
  ): Promise<boolean> {
    await this.puppeteer.combatStart()

    if (this._settings.config.saveToEphemeralBeforeCombat) {
      await this._play.saveGame(SaveType.ephemeral)
    }

    const playerWon = await new Promise<boolean>(resolve => {
      this.combat = this.combatFactory(params, playerWon => {
        this.combat = null
        resolve(playerWon)
      })
    })

    if (this.character.alive) {
      requestAnimationFrame(this.puppeteer.combatEnd)
    }

    return playerWon
  }

  /**
   * Action: Engage NPC in bargain
   */
  @action bargainWithNpc = (npcId: string) =>
    new Promise<void>(resolve => {
      this.puppeteer.openModal('bargain')
      this.bargain = this.bargainFactory(npcId, () => {
        this.bargain = null
        this.puppeteer.closeModal()
        resolve()
      })
    })

  /**
   * Open reader
   *
   * @param {string} id - The ID of the scripture to open
   */
  @action openReader = (id: string) => {
    const scripture = this.getEntity('scriptures', id)

    this.reader = scripture
  }

  @action closeReader = () => {
    if (this.reader?._id) {
      this.statistics.record('openedScriptures', this.reader._id)
    }

    this.reader = null
    this.questLog.evaluateQuests()
  }

  passesConditions<Verbose extends boolean = false>(
    conditions: TConditions,
    verbose?: Verbose
  ): Verbose extends true ? TVerboseConditionsResult<EditorGameCondition> : boolean

  passesConditions(conditions: TConditions = [], verbose: boolean = false): TConditionsResult {
    return Conditions.passesConditions(
      conditions,
      {
        game: this,
        achievements: this._achievements
      },
      verbose
    )
  }

  getEntityByConditions = <Type extends { conditions: TConditions }>(
    objs: Type[],
    customFilter?: (obj: Type) => boolean,
    triggerNotifications?: boolean
  ): Type | undefined => {
    const { triggerConditionNotifications } = this
    const aggregatedWhichConditions: [boolean, EditorGameCondition[]][] = []

    const selectedObj = objs.find(obj => {
      const { conditions } = obj

      if (customFilter && !customFilter(obj)) {
        return false
      }

      if (!conditions || conditions.length === 0) {
        return true
      }

      if (triggerNotifications) {
        const [passesConditions, whichConditions] = this.passesConditions(conditions, true)

        aggregatedWhichConditions.push([passesConditions, whichConditions])

        return passesConditions
      } else {
        return this.passesConditions(conditions)
      }
    })

    if (triggerNotifications) {
      triggerConditionNotifications(aggregatedWhichConditions)
    }

    return selectedObj
  }

  triggerConditionNotifications = (
    aggregatedWhichConditions: [boolean, EditorGameCondition[]][] = []
  ) => {
    const { notifications } = this
    const checks: { type: 'stat' | 'faction'; results: boolean[]; identifier: string }[] = []

    aggregatedWhichConditions.forEach(([passed, whichConditions]) => {
      whichConditions.forEach(condition => {
        let passedCheck: boolean | undefined
        let identifier: string | undefined

        if (condition.type === 'stat') {
          const [stat] = condition.parameters

          // Ignore the gold stat.
          if (stat === 'gold') {
            return
          }

          passedCheck = Game.convertConditionResultToOperatorResult(passed, condition)
          identifier = stat
        } else if (condition.type === 'numberVariable') {
          const [variableId] = condition.parameters
          const faction = this.factions.getByVariableId(variableId)

          if (!faction) return

          passedCheck = Game.convertConditionResultToOperatorResult(passed, condition)
          identifier = faction._id
        }

        if (identifier !== undefined && passedCheck !== undefined) {
          const existingCheck = checks.find(check => check.identifier === identifier)

          if (existingCheck) {
            existingCheck.results.push(passedCheck)
          } else {
            checks.push({
              type: condition.type === 'stat' ? 'stat' : 'faction',
              results: [passedCheck],
              identifier
            })
          }
        }
      })
    })

    checks.forEach(result => {
      const factionName = t(`FACTION-${result.identifier}-NAME`, { ns: 'factions' })
      const statName = t(`CHARACTER-ATTRIBUTE-${camelCaseToConstCase(result.identifier)}`)
      const translationKey = result.type === 'stat' ? 'STAT' : 'FACTION'
      const opts = { statName, factionName }

      if (result.results.every(result => result)) {
        notifications.create(t(`CONDITION-NOTIFICATION-${translationKey}-SUCCESS-MESSAGE`, opts))
      } else if (result.results.every(result => !result)) {
        notifications.create(t(`CONDITION-NOTIFICATION-${translationKey}-FAILURE-MESSAGE`, opts))
      } else if (result.results.some(result => !result)) {
        notifications.create(
          t(`CONDITION-NOTIFICATION-${translationKey}-PARTIAL_SUCCESS-MESSAGE`, opts)
        )
      }
    })
  }

  static convertConditionResultToOperatorResult = (
    passed: boolean,
    condition: EditorGameCondition
  ): boolean => {
    const positiveOperators: TStringOperator[] = ['equals', 'greaterThan', 'greaterThanOrEqual']
    const negativeOperators: TStringOperator[] = ['lowerThan', 'lowerThanOrEqual']
    const operator = condition.parameters[1]

    return (
      (passed && positiveOperators.includes(operator as TStringOperator)) ||
      (!passed && negativeOperators.includes(operator as TStringOperator))
    )
  }

  /**
   * Helper: Used to determine which label to display on options, which
   * narrative to display on a node, which outcome narrative to display
   * etc.
   *
   * @param {string} type - One of: 'outcome', 'option', 'path', 'node'
   * @param {array} values - The values i.e. option labels, node narratives etc
   * @param {string} id - The id of the entity (i.e. document._id)
   */
  getUsageValueIndex = (
    type: 'outcome' | 'option' | 'path' | 'node',
    entity: EditorOptionOutcome | Option | EditorPath | Node
  ): number => {
    let usages = 0
    let values: string[] = []

    switch (type) {
      case 'outcome':
        if ('event' in entity && entity.event.type === 'narrative') {
          usages = this.statistics.getRecord('seenOptionOutcomes', entity._id)
          values = entity.event.parameters[0]
        }
        break
      case 'option':
        if ('label' in entity) {
          usages = this.statistics.getRecord('usedOptions', entity._id)
          values = entity.label
        }
        break
      case 'path':
        if ('label' in entity) {
          usages = this.statistics.getRecord('usedPaths', entity._id)
          values = entity.label
        }
        break
      case 'node':
        if ('narrative' in entity) {
          usages = this.statistics.getRecord('seenNodes', entity._id)
          values = entity.narrative
        }
        break
    }

    return values[usages] ? usages : values.length - 1
  }

  /**
   * Helper: Saves 'hasSeen' type of data. Can be useful in places where a lot
   * of different data needs to be saved.
   *
   * @param {string|array} type - I.e. "location", "node", "area" etc.
   */
  saveCurrentState = (
    type:
      | 'location'
      | 'node'
      | 'area'
      | 'pathEncounter'
      | 'scene'
      | 'path'
      | ('location' | 'node' | 'area' | 'pathEncounter' | 'scene' | 'path')[]
  ) => {
    const { statistics } = this
    const lastSeenArea = statistics.getRecord('lastSeenArea')
    const lastSeenNode = statistics.getRecord('lastSeenNode')
    const lastSeenScene = statistics.getRecord('lastSeenScene')
    const lastSeenLocation = statistics.getRecord('lastSeenLocation')

    let types = []

    if (typeof type === 'string') {
      types.push(type)
    } else {
      types = [...type]
    }

    types.forEach(type => {
      switch (type) {
        case 'node':
          // Make sure that the last scene/node wasn't the same, to avoid
          // it being saved too many times. This might not be needed, but since
          // the code for saving these events is currently a little spaghetti...
          if (lastSeenNode !== this.scene.node._id) {
            const nodeId = this.scene.node._id
            this.statistics.record('seenNodes', nodeId)
          }
          break
        case 'scene':
          if (lastSeenScene !== this.scene.scene._id) {
            const sceneId = this.scene.scene._id
            this.statistics.record('seenScenes', sceneId)
          }
          break
        case 'area':
          if (lastSeenArea !== this.movement.location.area) {
            const areaId = this.movement.location.area
            this.statistics.record('seenAreas', areaId)
          }
          break
        case 'location':
          if (lastSeenLocation !== this.movement.locationId) {
            const locationId = this.movement.locationId
            this.statistics.record('seenLocations', locationId)
          }

          break
        case 'pathEncounter':
          if (this.movement.pathEncounter) {
            const pathEncounterId = this.movement.pathEncounter._id
            this.statistics.record('seenPathEncounters', pathEncounterId)
          }
          break
        case 'path':
          if (this.movement.currentPathId) {
            const { currentPathId } = this.movement
            this.statistics.record('usedPaths', currentPathId)
          }
          break
      }
    })
  }

  /**
   * Game over
   */
  @action gameOver = async () => {
    const {
      puppeteer,
      scene,
      sound,
      inspector,
      _content: {
        settings: { death }
      }
    } = this

    puppeteer.closeModal()

    if (this.combat) {
      // Allow combat animations and unmount to finish.
      // The number is arbitrary, but seems to work.
      await delay(Combat.loseTimeout)
    }

    scene.addNarrative(scene.deathNarrativeTranslationKey)
    puppeteer.death()

    if (death.audio) {
      sound.handleTrackChange(death.audio.track, death.audio)
    } else {
      try {
        await this.sound.killAllTracks()
      } catch (error) {
        logger.error(error)
      }
    }

    if (inspector) {
      inspector.bot.stop()
    }
  }

  @action mount = async () => {
    this.sound.init()
    this.character.mount()
    this.scene.mount()
    this.isRunning = true
  }

  @action unmount = async () => {
    this.factions.unmount()
    this.character.unmount()
    this.scene.unmount()
    await this.sound.killAllTracks()
  }

  static getNpcFromScene = (id: string, game: Game) => {
    const npc = game.actors.getNpc(id)

    if (!npc) {
      throw new Error(`getNpcFromScene: can't find NPC ${id}`)
    }

    return npc
  }

  conditions: TGameConditionFns = {
    // Character
    hasItem: (parameters, gameStore) => {
      const [id, operator, value] = parameters
      const parsedVal = Number(value)
      const itemCount = gameStore.character.inventory.getItemQuantity(id)

      return evaluateUsingStringOperator(operator, itemCount, parsedVal)
    },
    hasGainedItem: (parameters, gameStore) => {
      const [id, operator, value] = parameters
      const parsedVal = Number(value)
      const itemCount = gameStore.statistics.getRecord('gainedItems', id)

      return evaluateUsingStringOperator(operator, itemCount, parsedVal)
    },
    hasItemEquipped: (parameters, gameStore) => {
      const [id] = parameters
      return !!gameStore.character.inventory.items.find(i => i._id === id && i.equipped)
    },
    hasShieldEquipped: (_, gameStore) => {
      return gameStore.character.blockChance > 0
    },
    hasItemOfType: (parameters, gameStore) => {
      const [type] = parameters
      const typeCount = gameStore.character.inventory.items.filter(i => i.type === type).length
      return typeCount > 0
    },
    stat: (parameters, gameStore) => {
      const [stat, operator, value] = parameters
      const parsedVal = Number(value)

      return evaluateUsingStringOperator(operator, gameStore.character[stat], parsedVal)
    },
    canAttackRanged: (_, gameStore) => {
      return gameStore.character.attacks.canAttackRanged
    },
    canNegotiate: (parameters, gameStore) => {
      const npc = Game.getNpcFromScene(parameters[0], gameStore)
      const chance = 0.25 + (gameStore.character.charisma / npc.charisma) * 0.25

      return chance > Math.random()
    },
    canEscape: (parameters, gameStore) => {
      const npc = Game.getNpcFromScene(parameters[0], gameStore)
      const chance = 0.25 + (gameStore.character.agility / npc.agility) * 0.25

      return chance > Math.random()
    },
    hasHealth: (parameters, gameStore) => {
      const [operator, value] = parameters

      return evaluateUsingStringOperator(operator, gameStore.character.healthPercentage, value)
    },
    hasHealthValue: (parameters, gameStore) => {
      const [operator, value] = parameters

      return evaluateUsingStringOperator(operator, gameStore.character.health, value)
    },
    hasOpenedScripture: (parameters, gameStore) => {
      const [scriptureId] = parameters
      return gameStore.statistics.getRecord('openedScriptures', scriptureId)
    },
    hasLevel: (parameters, gameStore) => {
      const [hasLevelOperator, requiredLevel] = parameters

      return evaluateUsingStringOperator(hasLevelOperator, gameStore.character.level, requiredLevel)
    },
    hasExperience: (parameters, gameStore) => {
      const [hasExperienceOperator, requiredExperience] = parameters

      return evaluateUsingStringOperator(
        hasExperienceOperator,
        gameStore.character.experience,
        requiredExperience
      )
    },
    hasEffect: (parameters, gameStore) => {
      const [effectId] = parameters
      return gameStore.character.effects.hasEffect(effectId)
    },
    hasDefeatedNpcInCombat: (parameters, gameStore) => {
      const [npcId] = parameters
      return gameStore.statistics.getRecord('defeatedNpcsInCombat', npcId) > 0
    },
    hasKilledNpcInCombat: (parameters, gameStore) => {
      const [npcId] = parameters
      return gameStore.statistics.getRecord('killedNpcsInCombat', npcId) > 0
    },
    // NPCs
    npcStat: (parameters, gameStore) => {
      const [npcId, stat, operator, value] = parameters
      const npc = Game.getNpcFromScene(npcId, gameStore)

      return evaluateUsingStringOperator(operator, npc[stat], value)
    },
    npcIsDead: (parameters, gameStore) => {
      const npc = Game.getNpcFromScene(parameters[0], gameStore)
      return !npc.alive
    },
    npcHasHealth: (parameters, gameStore) => {
      const [npcId, operator, value] = parameters
      const npc = Game.getNpcFromScene(npcId, gameStore)

      return evaluateUsingStringOperator(operator, npc.healthPercentage, value)
    },
    npcHasHealthValue: (parameters, gameStore) => {
      const [npcId, operator, value] = parameters
      const npc = Game.getNpcFromScene(npcId, gameStore)

      return evaluateUsingStringOperator(operator, npc.health, value)
    },
    npcHasEffect: (parameters, gameStore) => {
      const [npcId, effectId] = parameters
      const npc = Game.getNpcFromScene(npcId, gameStore)

      return npc.effects.hasEffect(effectId)
    },
    // Scenes
    hasSeenNode: (parameters, gameStore) => {
      const [, nodeId] = parameters[0]
      return gameStore.statistics.getRecord('seenNodes', nodeId) > 0
    },
    hasSeenScene: (parameters, gameStore) => {
      const sceneId = parameters[0]
      return gameStore.statistics.getRecord('seenScenes', sceneId) > 0
    },
    hasUsedOption: (parameters, gameStore) => {
      const [, , option] = parameters[0]
      return gameStore.statistics.getRecord('usedOptions', option) > 0
    },
    hasSeenOptionOutcome: (parameters, gameStore) => {
      const [, , , outcomeId] = parameters[0]
      return gameStore.statistics.getRecord('seenOptionOutcomes', outcomeId) > 0
    },
    hasUsedOptionTimes: (parameters, gameStore) => {
      const [[, , optionId], operator, value] = parameters
      const usage = gameStore.statistics.getRecord('usedOptions', optionId)

      return evaluateUsingStringOperator(operator, usage, value)
    },
    hasSeenOptionOutcomeTimes: (parameters, gameStore) => {
      const [[, , , outcomeId], operator, value] = parameters
      const usage = gameStore.statistics.getRecord('seenOptionOutcomes', outcomeId)

      return evaluateUsingStringOperator(operator, usage, value)
    },
    // Quests
    isOnQuest: (parameters, gameStore) => {
      return !!gameStore.questLog.ongoingQuests.find(quest => quest._id === parameters[0])
    },
    isOnObjective: (parameters, gameStore) => {
      return !!gameStore.questLog.ongoingObjectives.find(
        objective => objective._id === parameters[0][1]
      )
    },
    hasCompletedQuest: (parameters, gameStore) => {
      return gameStore.questLog.hasCompletedQuest(parameters[0])
    },
    hasCompletedObjective: (parameters, gameStore) => {
      const [questId, objectiveId] = parameters[0]
      return gameStore.questLog.hasCompletedObjective(questId, objectiveId)
    },
    hasActivatedQuestObjectiveUpdate: (parameters, gameStore) => {
      const [questId, objectiveId, updateId] = parameters[0]
      return gameStore.questLog.hasActivatedQuestObjectiveUpdate(questId, objectiveId, updateId)
    },
    // Travel
    hasSeenLocation: (parameters, gameStore) => {
      const locationId = parameters[0]
      return gameStore.statistics.getRecord('seenLocations', locationId) > 0
    },
    hasSeenArea: (parameters, gameStore) => {
      const areaId = parameters[0]
      return gameStore.statistics.getRecord('seenAreas', areaId) > 0
    },
    // Variables
    stringVariable: (parameters, gameStore) => {
      const [variableId, operator, value] = parameters
      const variable = gameStore.variables.getVariable(variableId)

      if (!variable) {
        throw new Error(`stringVariable: can't find variable ${variableId}`)
      }

      if (variable.value === null || typeof variable.value === 'boolean') {
        return false
      }

      return evaluateUsingStringOperator(operator, variable.value, value)
    },
    numberVariable: (parameters, gameStore) => {
      const [variableId, operator, value] = parameters
      const variable = gameStore.variables.getVariable(variableId)

      if (!variable) {
        throw new Error(`numberVariable: can't find variable ${variableId}`)
      }

      if (variable.value === null || typeof variable.value === 'boolean') {
        return false
      }

      return evaluateUsingStringOperator(operator, variable.value, value)
    },
    booleanVariable: (parameters, gameStore) => {
      const [variableId, value] = parameters
      const variable = gameStore.variables.getVariable(variableId)
      return !!variable && variable.value === value
    },
    // Misc
    random: parameters => {
      return Number(parameters[0]) > Math.random()
    },
    wonLastCombatEngagement: (_, gameStore) => {
      return gameStore.statistics.getRecord('wonLastCombat')
    },
    arenaTier: (parameters, gameStore) => {
      return evaluateUsingStringOperator(parameters[0], gameStore.arena.currentTier, parameters[1])
    }
  }
}

export default Game
