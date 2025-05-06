import type { EditorAudio } from '@actnone/eldrum-editor/dist/types'
import type { CombatTurn } from './combat-turn'
import type Game from '../game'
import type {
  PlayerCombatParticipant,
  NpcCombatParticipant,
  TCombatParticipant
} from './combat-participant'

import { Animated, Easing } from 'react-native'
import { t } from '../../i18n'
import { observable, computed, action, when } from 'mobx'
import { analytics } from '../../helpers/analytics'
import { announceForAccessibility } from '../../helpers/accessibility'
import { logger } from '../../helpers/logger'
import { delay } from '../../helpers/misc'
import type Npc from '../character/npc'

enum CombatAnalyticsEvents {
  COMBAT_ENDED = 'Combat Ended'
}

export type TActionParticipant<T extends Npc = Npc> = {
  npc: T
  startingRow: 0 | 1 | 2 | 3
  healthLimit: number | null
}

export type TActionParticipants<T extends TActionParticipant = TActionParticipant> = [T, ...T[]]

export type TCombatOptions = {
  playerHealthLimit?: number | null
  customTurnOrder?: string[]
  customAudio?: EditorAudio
  isConfinedSpace?: boolean
}

export interface ICombatGenerics {
  Game: Game
  Opponent: NpcCombatParticipant
  Player: PlayerCombatParticipant
}

export abstract class Combat<G extends ICombatGenerics = ICombatGenerics> {
  constructor(
    public game: G['Game'],
    protected onEnd: (playerWon: boolean) => void,
    public combatOptions: TCombatOptions = {}
  ) {}

  @observable engaged: boolean = true
  automated = false
  playerSurrendered = false
  abstract participants: [G['Player'], G['Opponent'], ...G['Opponent'][]]

  @computed get aliveParticipants() {
    return this.participants.filter(participant => participant.isAlive)
  }

  @computed get deadParticipants() {
    return this.participants.filter(participant => !participant.isAlive)
  }

  @computed get turns() {
    return this.participants
      .reduce((turns: CombatTurn[], participant) => turns.concat(participant.turns), [])
      .sort((a: CombatTurn, b: CombatTurn) => {
        if (a.timestamp < b.timestamp) {
          return -1
        } else if (a.timestamp > b.timestamp) {
          return 1
        }

        return 0
      })
  }

  @computed get upcomingTurns() {
    return this.turns.filter(turn => !turn.hasPassed && !turn.isCurrent)
  }

  @computed get currentTurn() {
    return this.turns.find(turn => turn.isCurrent)
  }

  @computed get participantHasReachedHealthLimit() {
    return this.participants.find(participant => participant.hasReachedHealthLimit)
  }

  @computed get player() {
    return this.participants[0]
  }

  @computed get opponents(): G['Opponent'][] {
    const isOpponent = (participant: G['Opponent'] | G['Player']) => !participant.isPlayer

    return this.participants.filter(isOpponent)
  }

  @computed get aliveOpponents(): G['Opponent'][] {
    return this.opponents.filter(participant => participant.isAlive)
  }

  @computed get opponentsAreAlive() {
    return this.aliveOpponents.length > 0
  }

  @computed get opponentsGroupedByRow() {
    return this.opponents.reduce(
      (groupedOpponents: Record<number, G['Opponent'][]>, opponent: G['Opponent']) => {
        if (!groupedOpponents[opponent.row]) {
          groupedOpponents[opponent.row] = []
        }

        groupedOpponents[opponent.row].push(opponent)

        return groupedOpponents
      },
      {}
    )
  }

  @action rotateTurn = async () => {
    const { currentTurn } = this

    if (!this.engaged || !this.aliveOpponents.length) return

    if (currentTurn) {
      // runPostTurnHooks Must run before the next turn is selected because they might affect
      // speed which can change the turn order, causing turns to be skipped.
      await this.runPostTurnHooks(currentTurn.participant)
    }

    const nextTurn = currentTurn
      ? this.turns[this.turns.findIndex(turn => turn.id === currentTurn?.id) + 1]
      : this.turns[0]

    if (currentTurn) {
      currentTurn?.participant.shiftOutTurn()
    }

    if (!nextTurn) return

    await delay(75) // Artificial delay to make the turn rotation more visible and give the device some time render the changes caused by shifting out the turn

    const distance = currentTurn
      ? nextTurn.timestamp - currentTurn.timestamp
      : Math.abs(0 - nextTurn.timestamp)

    await this.animateTimeline(nextTurn.timestamp, distance)

    const turnTakerIsAutomated = !nextTurn.participant.isPlayer || this.automated
    let turnWasInterrupted = false

    try {
      const { participant } = nextTurn

      if (this.game._ui.screenReaderEnabled) {
        await announceForAccessibility(
          participant.isPlayer
            ? t('COMBAT-TURNS-YOUR_TURN-LABEL')
            : t('COMBAT-TURNS-OPPONENT_TURN-LABEL', { name: nextTurn.participantName })
        )
      }

      participant.shiftInTurn()

      // runPreTurnHooks Must run after the next was added because it might affect
      // speed which can change the turn order, causing turns to be skipped.
      await this.runPreTurnHooks(participant)

      participant.resetActionPoints()

      if (turnTakerIsAutomated && 'automateTurn' in participant) {
        await participant.automateTurn()
      }
    } catch (error) {
      turnWasInterrupted = true
    } finally {
      if (turnWasInterrupted || (turnTakerIsAutomated && this.player.isAlive)) {
        this.rotateTurn()
      }
    }
  }

  runPreCombatHooks = () => this.runCombatHooks('pre')
  runPostCombatHooks = () => this.runCombatHooks('post')

  runCombatHooks = (hook: 'pre' | 'post' = 'pre') => {
    const { aliveParticipants } = this

    aliveParticipants.forEach(participant => {
      for (let i = participant.actor.passives.length - 1; i >= 0; i--) {
        const passive = participant.actor.passives[i]

        if (passive && hook === 'pre') {
          passive.preCombat(participant)
        } else if (passive) {
          passive.postCombat(participant)
        }
      }
    })
  }

  runPreTurnHooks = async (participant: TCombatParticipant) => {
    const passives = participant.actor.passives

    for (let i = passives.length - 1; i >= 0; i--) {
      const passive = passives[i]

      await passive.preCombatTurn(participant)

      if (!participant.isAlive) {
        throw new Error('Participant is not alive')
      }
    }
  }

  runPostTurnHooks = async (participant: TCombatParticipant) => {
    const { passives } = participant.actor

    for (let i = passives.length - 1; i >= 0; i--) {
      const passive = passives[i]

      if (!participant.isAlive) {
        return
      }

      await passive.postCombatTurn(participant)
    }
  }

  timelinePosition: Animated.Value = new Animated.Value(0)

  @action animateTimeline = (timestamp: number, distance: number = 750) =>
    new Promise(resolve => {
      const duration = distance / 8

      Animated.timing(this.timelinePosition, {
        easing: Easing.in(Easing.cubic),
        duration,
        useNativeDriver: true,
        toValue: timestamp
      }).start(resolve)
    })

  @action init = async () => {
    await delay(1000)

    if (this.game._ui.screenReaderEnabled) {
      await announceForAccessibility(t('COMBAT-INITIATION-A11Y_ANNOUNCEMENT'))
    }

    this.timelinePosition.setValue(this.turns[0].timestamp)
    this.runPreCombatHooks()
    this.rotateTurn()

    logger.sentry?.addBreadcrumb({
      category: 'combat.start'
    })
  }

  getLootIds = () =>
    this.opponents.reduce(
      (ids: string[], opponent) =>
        !opponent.isAlive && opponent.actor.loot ? [...ids, opponent.actor.loot] : ids,
      []
    )

  @action recordStatistics = (playerWon: boolean) => {
    if (playerWon) {
      this.opponents.forEach(participant => {
        this.game.statistics.record('defeatedNpcsInCombat', participant.actor._id)
      })
    }

    this.game.statistics.record('wonLastCombat', playerWon)
  }

  postConstruct = () => {
    const { customTurnOrder, customAudio } = this.combatOptions

    when(
      () => {
        if (
          this.participantHasReachedHealthLimit ||
          !this.opponentsAreAlive ||
          !this.player.isAlive
        ) {
          return true
        }

        return false
      },
      () => this.fightOver()
    )

    if (customTurnOrder?.length) {
      customTurnOrder.forEach((id, index) => {
        const participant = this.participants.find(participant => participant.id === id)

        if (participant) {
          participant.addTurn(index * 50)
        }
      })
    }

    this.participants.forEach(participant => participant.addTurn())

    if (this.game.inspector?.bot.running) {
      this.automated = true
    }

    this.activateMusic(customAudio)
  }

  activateMusic = (customAudio?: EditorAudio) => {
    const { game } = this
    const {
      _content: { settings }
    } = game
    const combatAudio = customAudio || (settings.combat?.audio && settings.combat?.audio)

    if (combatAudio) {
      game.sound.handleTrackChange(combatAudio.track, combatAudio)
      game.sound.audioChangeThroughCombatHasTakenPlace = true
    }
  }

  @action async fightOver() {
    const { player } = this
    const playerWon = player.isAlive && !player.hasReachedHealthLimit

    // Timeout needed for the progressbar animation to finish.
    // Give it some extra time in order to have time to unmount
    // events, counter-attack etc before the combat class instance
    // is destroyed.
    const loseTimeout = Combat.loseTimeout
    const winTimeout = 1250
    const timeout = this.opponentsAreAlive ? loseTimeout : winTimeout

    await delay(loseTimeout - 400)

    this.runPostCombatHooks()

    this.engaged = false
    await delay(timeout) // Needed to let the combat component unmount before showing the death screen

    if (player.actor.alive) {
      if (playerWon) {
        const loot = this.game.character.inventory.calculateLootFromMultiple(this.getLootIds())

        if (loot && (loot.gold || loot.items.length)) {
          this.game.character.inventory.pickUpLoot(loot)
        }
      }

      this.player.retrieveAndEquipReleasedItems()
    }

    const opponentNames = this.opponents
      .map(opponent => opponent.actor._alias || opponent.actor.name)
      .map(name => (name ? name.replace(/\s/g, '') : name))
      .join(',')

    this.recordStatistics(playerWon)

    analytics.event(CombatAnalyticsEvents.COMBAT_ENDED, {
      opponents: opponentNames,
      win: playerWon,
      surrendered: this.playerSurrendered
    })

    logger.sentry?.addBreadcrumb({
      category: 'combat.end'
    })

    if (player.actor.alive) {
      this.onEnd(playerWon)
    }
  }

  static loseTimeout = 750
}

export default Combat
