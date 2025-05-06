import type {
  EditorOptionOutcome,
  EditorPath,
  EditorAction
} from '@actnone/eldrum-editor/dist/types'
import type Game from '../game'
import type Option from '../scene/option'

import { observable, action, reaction, type IReactionDisposer } from 'mobx'
import { delay, randomFromList } from '../../helpers/misc'
import { logger } from '../../helpers/logger'
import { Timer } from '../timer'

const NO_GAME_ERROR = 'No game initialized. Cannot start content test.'
const OPTION_DELAY_MS = 250

export class Bot {
  constructor(private readonly game: Game) {}

  lastThreeUsedOptions: string[] = []
  onItemPickUp?: IReactionDisposer
  onBargain?: IReactionDisposer
  @observable ignoreLethalOptions: boolean = true
  @observable promptBeforeCombat: boolean = true
  @observable autoCloseBargain: boolean = true
  @observable autoEquipItems: boolean = true
  @observable running: boolean = false

  private readonly loop = new Timer({
    duration: OPTION_DELAY_MS,
    onComplete: async () => {
      const { game } = this

      if (!game) {
        this.stop()
        return logger.error(new Error(NO_GAME_ERROR))
      }

      try {
        let hasUsedOption = false
        let hasUsedMovementOption = false

        const option = this.selectOptionToUse()

        if (option) {
          await this.useOption(option)
          hasUsedOption = true
        }

        if (this.outOfOptions()) {
          await this.pauseWithAlert(
            "Something's wrong",
            "There's only a single option, and it's been attempted several times. This may need manual resolvement."
          )
        }

        if (game.scene.type === 'location' && this.getOptions(false).length === 0) {
          hasUsedMovementOption = await this.useMovementOption()
        }

        if (!hasUsedOption && !hasUsedMovementOption) {
          await this.pauseWithAlert("Something's wrong", 'There are no options available.')
        }

        if (this.running) {
          this.loop.restart()
        }
      } catch (error) {
        logger.error(error)
      }
    }
  })

  private recordLastUsedOption(optionId: string) {
    this.lastThreeUsedOptions.push(optionId)

    if (this.lastThreeUsedOptions.length > 3) {
      const lastIndex = this.lastThreeUsedOptions.length - 1

      this.lastThreeUsedOptions = [
        this.lastThreeUsedOptions[lastIndex - 2],
        this.lastThreeUsedOptions[lastIndex - 1],
        this.lastThreeUsedOptions[lastIndex]
      ]
    }
  }

  @action start = () => {
    this.addListeners()
    this.running = true
    this.loop.restart()
  }

  @action stop = () => {
    this.removeListeners()
    this.running = false
    this.loop.stop()
  }

  @action toggleIgnoreLethalOption = () => (this.ignoreLethalOptions = !this.ignoreLethalOptions)
  @action toggleAutoEquipItems = () => (this.autoEquipItems = !this.autoEquipItems)
  @action togglePromptBeforeCombat = () => (this.promptBeforeCombat = !this.promptBeforeCombat)
  @action toggleAutoCloseBargain = () => {
    this.autoCloseBargain = !this.autoCloseBargain

    if (!this.onBargain) {
      this.addBargainListener()
    } else if (this.onBargain) {
      this.onBargain()
    }
  }

  addBargainListener = () => {
    this.onBargain = reaction(
      () => this.game.bargain,
      bargain => {
        const { inspector } = this.game
        const isOnTaskToPurchaseItem =
          inspector?.test?.currentTask?.currentStep?.type === 'purchaseItem'

        if (bargain && !isOnTaskToPurchaseItem) {
          bargain.endBargain()
        }
      },
      { name: 'BotAutoCloseBargain' }
    )
  }

  addListeners = () => {
    this.onItemPickUp = reaction(
      () => this.game.character.inventory.items.length,
      newInventoryLength => {
        const { character } = this.game
        const pickedUpItem = character.inventory.items[character.inventory.items.length - 1]

        if (!pickedUpItem || pickedUpItem.hasSeen) {
          return
        }

        switch (pickedUpItem.type) {
          case 'scripture': {
            const { statistics } = this.game

            if (
              pickedUpItem.scripture &&
              !statistics.getRecord('openedScriptures', pickedUpItem.scripture)
            ) {
              statistics.record('openedScriptures', pickedUpItem.scripture)
            }
            break
          }
          case 'armor':
          case 'weapon':
          case 'shield':
          case 'treasure': {
            if (this.autoEquipItems && pickedUpItem.canEquip && !pickedUpItem.equipped) {
              character.inventory.equipItem(pickedUpItem.uuid)
            }
          }
        }

        character.inventory.markItemAsSeen(pickedUpItem._id)
      },
      { name: 'onItemPickUp' }
    )

    if (this.autoCloseBargain) {
      this.addBargainListener()
    }
  }

  removeListeners = () => {
    this.onItemPickUp && this.onItemPickUp()
    this.onBargain && this.onBargain()
  }

  private readonly useOption = async (option: Option) => {
    const { game } = this
    const { scene, statistics } = game

    this.writeToLog(scene.node.availableOptions, option)
    this.recordLastUsedOption(option._id)

    const outcome = option.outcomes.length ? scene.getOptionOutcome(option.outcomes, false) : null

    if (!outcome) {
      logger.warn(`Option "${option.label[0]}" has no outcome, skipping...`)

      statistics.record('usedOptions', option._id)

      await delay(OPTION_DELAY_MS)
      return true
    }

    const isLethalOutcome = this.isLethalOption(option)

    if (isLethalOutcome) {
      await this.pauseWithAlert(
        'Warning',
        `Option "${option.label[0]}" will result in lethal outcome. Continue?`
      )
    }

    if (
      option.actions.find(action => action.type === 'engageInCombat') &&
      this.promptBeforeCombat
    ) {
      await this.pauseWithAlert(
        'Warning',
        `Option "${option.label[0]}" initiates combat. Continue?`
      )
    }

    await delay(OPTION_DELAY_MS)
    await game.scene.executeOption(option)
    return true
  }

  private readonly selectOptionToUse = () => {
    const { scene, statistics } = this.game
    const currentTestTargetId = this.getCurrentTestTargetOptionId()
    let option

    if (currentTestTargetId) {
      option = scene.node.availableOptions.find(option => currentTestTargetId === option._id)
    }

    if (!option) {
      const unUsedOptions = this.getOptions(false)
      option = randomFromList(unUsedOptions)
    }

    if (!option) {
      let usedOptions = this.getOptions(true)

      // Avoid using the same option again if possible.
      if (usedOptions.length > 1) {
        usedOptions = usedOptions.filter(
          option => option._id !== statistics.getRecord('lastUsedOption')
        )
      }

      option = randomFromList(usedOptions)
    }

    return option
  }

  private readonly getCurrentTestTargetOptionId = () => {
    const { inspector } = this.game
    const currentTestTarget = inspector?.test?.currentTarget

    return currentTestTarget && currentTestTarget.type === 'preferredOption'
      ? currentTestTarget.id
      : undefined
  }

  private getOptions(used?: boolean, treatPreferredAsUnused: boolean = true) {
    const { scene, statistics, inspector } = this.game
    const optionIdsToIgnore = inspector?.test?.optionIdsToIgnore || []
    const currentTestTargetId = this.getCurrentTestTargetOptionId()

    return scene.node.availableOptions.filter(option => {
      const conditions = [!optionIdsToIgnore.includes(option._id)]

      if (used !== undefined && !(treatPreferredAsUnused && option._id === currentTestTargetId)) {
        conditions.push(statistics.hasUsedOption(option._id) === used)
      }

      if (this.ignoreLethalOptions) {
        conditions.push(!this.isLethalOption(option))
      }

      return conditions.every(condition => condition)
    })
  }

  private readonly useMovementOption = async () => {
    const { game } = this
    const {
      statistics,
      movement: { localPaths },
      inspector
    } = game

    const currentTestTarget = inspector?.test?.currentTarget
    let pathToUse

    if (currentTestTarget && currentTestTarget.type === 'preferredPath') {
      pathToUse = localPaths.find(path => currentTestTarget.id === path._id)
    }

    if (!pathToUse) {
      const lastSeenLocation = statistics.getRecord('lastSeenLocation')
      const lastUsedMovementOption = statistics.getRecord('lastUsedMovementOption')

      const localUnusedPaths = localPaths.filter(
        path => !statistics.hasSeenLocation(path.to) && !statistics.hasUsedMovementOption(path._id)
      )
      const localUsedPaths = localPaths.filter(
        path => statistics.hasSeenLocation(path.to) || statistics.hasUsedMovementOption(path._id)
      )
      const usedPathsExcludingPrevious = localUsedPaths.filter(
        path => ![lastSeenLocation, lastUsedMovementOption].includes(path.to)
      )

      pathToUse =
        (localUnusedPaths.length && randomFromList(localUnusedPaths)) ||
        (usedPathsExcludingPrevious.length && randomFromList(usedPathsExcludingPrevious)) ||
        randomFromList(localUsedPaths)
    }

    if (pathToUse) {
      this.writeToLog(localPaths, pathToUse)
      await game.movement.executePathOption(pathToUse)
      return true
    }

    return false
  }

  pauseWithAlert = (title: string, message: string) =>
    new Promise<void>((resolve, reject) => {
      const { game } = this

      game._ui.alert(
        title,
        message,
        [
          {
            text: 'Stop',
            onPress: this.stop
          },
          { text: 'Continue', onPress: resolve }
        ],
        {
          onDismiss: this.stop
        }
      )
    })

  private readonly isLethalOption = (option: Option) => {
    const { scene } = this.game
    const outcome = option.outcomes.length ? scene.getOptionOutcome(option.outcomes, false) : null

    if (outcome) {
      return this.isLethalOutcome(option, outcome)
    } else {
      return false
    }
  }

  private readonly isLethalOutcome = (option: Option, outcome: EditorOptionOutcome) => {
    return Boolean(
      outcome.actions.find(this.isLethalAction) || option.actions.find(this.isLethalAction)
    )
  }

  private readonly isLethalAction = (action: EditorAction) => {
    const { game } = this

    return action.type === 'changeHealth' && game.character.health + action.parameters[0] < 1
  }

  private readonly outOfOptions = () => {
    return (
      this.getOptions().length === 1 &&
      this.lastThreeUsedOptions.length > 2 &&
      this.lastThreeUsedOptions.every(optionId => optionId === this.lastThreeUsedOptions[0])
    )
  }

  private readonly writeToLog = (
    entities: Option[] | EditorPath[],
    selectedEntity: Option | EditorPath
  ) => {
    logger.debug(
      `\n${entities
        .map(entity => {
          return entity === selectedEntity ? 'X ' + entity.label[0] : '- ' + entity.label[0]
        })
        .join('\n')}`
    )
  }
}

export default Bot
