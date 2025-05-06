import { computed, observable, action } from 'mobx'
import { t } from '../../i18n'
import { uuid, initialsFromString } from '../../helpers/misc'
import type { TCombatParticipant } from './combat-participant'

abstract class CombatTurn {
  constructor(public participant: TCombatParticipant) {}

  id: string = uuid()

  @observable isCurrent: boolean = false
  @observable passedTimestamp: number | null = null
  abstract timestamp: number

  @computed get hasPassed() {
    return !!(typeof this.passedTimestamp === 'number' && !this.isCurrent)
  }

  @computed get participantNameAbbreviated() {
    const { name, id } = this.participant

    if (id === 'player') {
      return t('COMBAT-TURNS-TURN_TIMELINE-PLAYER-LABEL')
    } else {
      return initialsFromString(name)
    }
  }

  get isPlayer() {
    return this.participant.isPlayer
  }

  get participantName() {
    return this.participant.name || t('COMBAT-TURNS-TURN_TIMELINE-PLAYER-LABEL')
  }

  @action activateTurn = () => {
    this.passedTimestamp = this.timestamp
    this.isCurrent = true
  }

  @action deActivateTurn = () => {
    this.isCurrent = false
  }
}

class CustomTurn extends CombatTurn implements CombatTurn {
  constructor(
    public participant: TCombatParticipant,
    public timestamp: number
  ) {
    super(participant)
  }
}

class RegularTurn extends CombatTurn implements CombatTurn {
  @computed private get anticipatedTimestamp(): number {
    const { participant } = this

    const previousTurn =
      participant.turns.length > 1 ? participant.turns[participant.turns.length - 2] : null

    if (!previousTurn) {
      return this.participant.initialTurnDelay
    }

    const anticipatedTimestamp = previousTurn.timestamp + participant.turnInterval

    // Never allow an anticipated timestamp to be less than the current turn's timestamp,
    // because that would cause the turn to be skipped, and the participant would never get a turn again.
    const currentTurnParticipant = this.participant.participants.find(
      opponent => opponent.currentTurn
    )

    if (currentTurnParticipant === this.participant) {
      return anticipatedTimestamp
    }

    if (currentTurnParticipant?.currentTurn) {
      return Math.max(anticipatedTimestamp, currentTurnParticipant.currentTurn.timestamp + 1)
    }

    return anticipatedTimestamp
  }

  @computed get timestamp() {
    return typeof this.passedTimestamp === 'number'
      ? this.passedTimestamp
      : this.anticipatedTimestamp
  }
}

export type { CombatTurn }
export { CustomTurn, RegularTurn }
