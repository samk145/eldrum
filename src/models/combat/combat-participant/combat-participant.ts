import type { TActor } from '../../character/t-actor'
import type { CombatAction, TCombatActionType } from '../combat-action'
import type { Combat } from '../combat'
import type { CombatTurn } from '../combat-turn'
import type { CombatAttackSet } from '../combat-attack-set'
import type { CombatBehavior } from '../combat-behavior'

import { action, computed, observable } from 'mobx'
import { announceForAccessibility } from '../../../helpers/accessibility'

import { RegularTurn, CustomTurn } from '../combat-turn'
import { CombatParticle } from '../combat-particle'
import {
  MoveEvent,
  ImmuneEvent,
  type TCombatEvent,
  type CombatEvent,
  StanceEvent,
  HoldEvent
} from '../combat-events'
import { delay, randomFromList } from '../../../helpers/misc'

const MAX_PARTICIPANTS_PER_ROW = 3
const MAX_TURNS_TO_KEEP = 8 // Roughly equates how many turns the player can see
const MAX_EVENTS_TO_KEEP = 10 // Roughly equates how many events can be visible at once

type TTeamId = '1' | '2'

export interface ICombatParticipantGenerics {
  Actor: TActor
  Combat: Combat
  CombatAction: CombatAction
  CombatAttackSet: CombatAttackSet
  CombatEvent: CombatEvent
  CombatBehavior: CombatBehavior
}

export abstract class CombatParticipant<
  G extends ICombatParticipantGenerics = ICombatParticipantGenerics
> {
  constructor(
    { row, healthLimit = null }: { row: number; healthLimit: number | null },
    public actor: G['Actor'],
    protected combat: G['Combat']
  ) {
    this.row = row
    this.healthLimit = healthLimit

    this.initialTurnDelay = CombatParticipant.initialTurnDelay(
      this.turnInterval,
      this.actor.stats.initiative.value
    )
  }

  abstract isPlayer: boolean
  abstract teamId: TTeamId
  healthLimit: number | null
  abstract combatActions: G['CombatAction'][]
  @observable events: G['CombatEvent'][] = []
  @observable currentCombatActionIndex = 0
  @observable targetId: string | null = null
  @observable row: number
  @observable actionPoints = 0
  @observable advantagePoints = 0
  @observable isPerformingAction: boolean = false
  initialTurnDelay: number = 0
  abstract combatAttackSets: G['CombatAttackSet'][]
  abstract hasAvailableRangedAttack: boolean
  abstract hasUsableRangedAttack: boolean
  abstract useRandomUsableCombatAttackSet: () => void
  abstract behavior: G['CombatBehavior']

  public readonly maxAdvantagePoints = 5000

  @computed get maxActionPoints() {
    return this.actor.maxActionPoints
  }

  @computed get canAttack(): boolean {
    return !!(this.target && this.target.isAlive && this.usableCombatAttackSets.length)
  }

  get id() {
    return this.actor._id
  }

  get name() {
    return this.actor.name || 'You'
  }

  @computed get usableCombatActions(): G['CombatAction'][] {
    return this.combatActions.filter(ca => ca.usable)
  }

  @computed get participants(): G['Combat']['participants'] {
    return this.combat.participants
  }

  @computed get opponents(): G['Combat']['opponents'] {
    return this.participants.filter(
      participant => participant.teamId !== this.teamId
    ) as G['Combat']['opponents']
  }

  @computed get teamMembers(): (G['Combat']['participants'][0] | G['Combat']['participants'][1])[] {
    return this.participants.filter(
      participant => participant.teamId === this.teamId && participant.id !== this.id
    )
  }

  @computed get aliveTeamMembers() {
    return this.teamMembers.filter(participant => participant.isAlive)
  }

  @computed get aliveOpponents(): G['Combat']['opponents'] {
    return this.opponents.filter(participant => participant.isAlive)
  }

  @computed get aliveParticipants() {
    return this.participants.filter(participant => participant.isAlive)
  }

  @action performAction = async (
    action?: () => Promise<void> | void,
    actionCost: number = 1,
    advantageCost: number = 0
  ) => {
    if (!this.canPerformAction) {
      return
    }

    this.isPerformingAction = true
    this.spendActionPoint(actionCost)

    if (advantageCost) {
      this.removeAdvantagePoints(advantageCost)
    }

    await this.runPreActionHooks()

    try {
      if (action) {
        await action()
      }
    } finally {
      this.isPerformingAction = false
    }

    await this.runPostActionHooks()

    if (!this.combat.automated && this.isPlayer && this.actionPoints === 0) {
      this.combat.rotateTurn()
    }
  }

  @action hold = async () => {
    await this.addEvent(new HoldEvent())
  }

  @action endTurn = () => {
    this.actionPoints = 0
    this.combat.rotateTurn()
  }

  private async runPreActionHooks() {
    const { passives } = this.actor

    for (let i = passives.length - 1; i >= 0; i--) {
      await passives[i]?.preAction(this)
    }
  }

  private async runPostActionHooks() {
    const { passives } = this.actor

    for (let i = passives.length - 1; i >= 0; i--) {
      await passives[i]?.postAction(this)
    }
  }

  get canPerformAction() {
    return !!(!this.isOnCooldown && !this.isPerformingAction && this.hasActionPoints)
  }

  @computed get protection() {
    return this.actor.protection
  }

  @computed get isAlive() {
    return this.actor.alive
  }

  healthPercentageIs(operator: 'below' | 'above', percentage: number) {
    const { actor } = this

    switch (operator) {
      case 'below':
        return actor.healthPercentage <= percentage
      case 'above':
        return actor.healthPercentage >= percentage
    }
  }

  @computed get hasReachedHealthLimit() {
    return !!(this.healthLimit && this.healthLimit >= this.actor.health)
  }

  @computed get speedMs() {
    return (1 / this.actor.speed) * 1000
  }

  /**
   * The interval in which new turns become available
   */
  @computed get turnInterval() {
    const { speedMs } = this

    return Math.floor(speedMs / 2 + speedMs)
  }

  @observable turns: CombatTurn[] = []

  @computed get currentTurn() {
    return this.turns.find(turn => turn.isCurrent)
  }

  get upcomingTurns() {
    return this.turns.filter(turn => !(turn.isCurrent || turn.hasPassed))
  }

  @computed get isOnCooldown() {
    return !(this.currentTurn && this.hasActionPoints)
  }

  @computed get canBlock() {
    return Boolean(this.actor.blockChance)
  }

  @action useRandomUsableCombatAction = async (
    filter?: (combatAction: G['CombatAction']) => boolean
  ) => {
    const { usableCombatActions } = this
    const randomCombatAction = filter
      ? randomFromList(usableCombatActions.filter(filter))
      : randomFromList(usableCombatActions)

    await this.performAction(randomCombatAction.use)
  }

  @computed({ keepAlive: true }) get combatActionsThatFulfillNonAdvantageReq() {
    return this.combatActions.filter(combatAction => combatAction.fulfillsNonAdvantageRequirements)
  }

  @computed get canUseCombatAction() {
    return !!(this.target && this.target.isAlive && this.usableCombatActions.length)
  }

  @action addTurn = (timestamp?: number) => {
    if (timestamp !== undefined) {
      this.turns.push(new CustomTurn(this, timestamp))
    } else {
      this.turns.push(new RegularTurn(this))
    }

    this.turns = this.turns.slice(-MAX_TURNS_TO_KEEP)
  }

  @action shiftInTurn = () => {
    const upcomingTurns = this.turns.filter(turn => !(turn.isCurrent || turn.hasPassed))

    upcomingTurns[0].activateTurn()

    if (upcomingTurns.length === 1) {
      this.addTurn()
    }
  }

  @action shiftOutTurn = () => {
    if (this.currentTurn) {
      this.currentTurn.deActivateTurn()
    }
  }

  @computed get fallbackTargetIndex() {
    const { aliveOpponents, row, targetId, opponents } = this
    const previousTarget = targetId && opponents.find(p => p.id === targetId)
    const rows = [...new Set(aliveOpponents.map(o => o.row))]
    const closestRow = previousTarget
      ? CombatParticipant.findClosestRowTo(previousTarget.row, rows)
      : CombatParticipant.findClosestRowTo(row, rows)
    const closestOpponents = aliveOpponents.filter(opponent => opponent.row === closestRow)
    const opponentIndexInAliveOpponents = aliveOpponents.indexOf(closestOpponents[0])

    return opponentIndexInAliveOpponents
  }

  @computed get target(): G['Combat']['participants'][number] {
    const { aliveOpponents, targetId, fallbackTargetIndex, opponents } = this

    return (
      aliveOpponents.find(p => p.id === targetId) ||
      aliveOpponents[fallbackTargetIndex] ||
      opponents[0]
    )
  }

  get chanceToHitCurrentTarget() {
    return (
      1 -
      CombatParticle.chanceToEvade(this.actor.hitMeleeChance, this.target.actor.evadeMeleeChance)
    )
  }

  @computed get distanceToTarget() {
    return CombatParticle.distanceToTarget(this.row, this.target.row)
  }

  @computed get distanceToOpponentFurthestAway() {
    const opponentFurthestAway = this.aliveOpponents.reduce((distance: number, opponent) => {
      const distanceToOpponent = CombatParticle.distanceToTarget(this.row, opponent.row)
      if (distanceToOpponent > distance) {
        return distanceToOpponent
      } else {
        return distance
      }
    }, 0)

    return opponentFurthestAway
  }

  @computed get pathToTarget() {
    const { distanceToTarget, row, target } = this

    return distanceToTarget
      ? new Array(distanceToTarget + 1)
          .fill(null)
          .map((_, index) => (row > target.row ? row - index : row + index))
      : []
  }

  @computed get targetAxisDirection() {
    return this.row - this.target.row > 0 ? 'negative' : 'positive'
  }

  @computed get nextRowInTargetDirection() {
    return this.pathToTarget.length > 1 ? this.pathToTarget[1] : null
  }

  @computed get aliveOpponentsBetweenTargetAndSelf() {
    const { aliveOpponents, pathToTarget } = this
    const pathToTargetWithoutTargetRow = pathToTarget.slice(0, pathToTarget.length - 1)

    const opponents = aliveOpponents.filter(opponent => {
      return pathToTargetWithoutTargetRow.includes(opponent.row)
    })

    return opponents
  }

  @computed get canMove() {
    return !this.actor.effects.list.find(effect => effect.preventsMovementInCombat)
  }

  @computed get canMoveTowardsTarget() {
    const { aliveOpponents, nextRowInTargetDirection, aliveTeamMembers } = this

    if (!this.canMove) {
      return false
    }

    const thereAreOpponentsInNextRow = !!aliveOpponents.filter(combatParticipant => {
      return nextRowInTargetDirection === combatParticipant.row
    }).length

    if (thereAreOpponentsInNextRow) {
      return false
    }

    const teamMembersInNextRow = aliveTeamMembers.filter(combatParticipant => {
      return nextRowInTargetDirection === combatParticipant.row
    }).length

    return !!(teamMembersInNextRow < MAX_PARTICIPANTS_PER_ROW && nextRowInTargetDirection !== null)
  }

  @computed get canMoveAwayFromTarget() {
    if (
      !this.canBeMovedAwayFromOpponent ||
      CombatParticipant.movementAdvantageCost > this.advantagePoints ||
      this.distanceToOpponentFurthestAway > 3
    ) {
      return false
    }

    return true
  }

  @computed get canBeMovedAwayFromOpponent() {
    if (!this.canMove || this.combat.combatOptions.isConfinedSpace) {
      return false
    }

    return true
  }

  @computed get hasActionPoints() {
    return this.actionPoints > 0
  }

  @action addAdvantagePoints = (points: number = 0) => {
    this.advantagePoints = Math.round(
      Math.min(this.maxAdvantagePoints, this.advantagePoints + points)
    )
  }

  @action resetAdvantagePoints = () => {
    this.advantagePoints = 0
  }

  @action removeAdvantagePoints = (points: number) => {
    this.advantagePoints = Math.max(0, this.advantagePoints - points)
  }

  @computed get stanceId(): string | undefined {
    return this.actor.effects.list.find(effect => effect.isStance)?.id
  }

  get isInStance() {
    return Boolean(this.stanceId)
  }

  @action changeStance = async (name: string, event = true) => {
    this.actor.effects.addEffect(name)

    if (event) {
      await this.addEvent(new StanceEvent(name))
    }
  }

  @action breakStance = () => {
    this.actor.effects.removeStanceEffects()
  }

  @action takeDamage = (damage: number) => {
    const limit = this.healthLimit || undefined

    this.actor.changeHealth(-damage, false, limit)

    if (!this.isAlive || this.actor.health === limit) {
      this.removeUpcomingTurns()
    }
  }

  @action attemptToApplyEffect = async (id: string) => {
    const succeeded = this.actor.effects.addEffect(id)

    if (succeeded) {
      return
    }

    await this.addEvent(new ImmuneEvent())
    throw Error()
  }

  @action selectTargetById = (id: string) => {
    this.targetId = id
  }

  @action addEvent = async (event: TCombatEvent, delayTime?: number) => {
    this.events.push(event)

    if (this.combat.game._ui.screenReaderEnabled) {
      await announceForAccessibility(event.getLabel())
    } else if (delayTime) {
      await delay(delayTime)
    }

    this.events = this.events.slice(-MAX_EVENTS_TO_KEEP)
  }

  @action changeRow = (newRow: number) => {
    this.row = newRow
  }

  @action moveTowardsTargetAsAction = async () => {
    await this.performAction(() => this.moveTowardsTarget(true))
  }

  @action moveAwayFromTargetAsAction = async (
    advantageCost = CombatParticipant.movementAdvantageCost
  ) => {
    await this.performAction(() => this.moveAwayFromTarget(true), undefined, advantageCost)
  }

  @action moveTowardsTarget = async (event: boolean = false) => {
    const { targetAxisDirection, pathToTarget } = this
    const newRow = targetAxisDirection === 'positive' ? pathToTarget[0] + 1 : pathToTarget[0] - 1

    await this.move(newRow, event)
  }

  @action moveAwayFromTarget = async (event: boolean = false) => {
    const { targetAxisDirection, pathToTarget } = this
    const newRow = targetAxisDirection === 'positive' ? pathToTarget[0] - 1 : pathToTarget[0] + 1

    await this.move(newRow, event)
  }

  @action move = async (row: number, event: boolean = false, eventSource?: string) => {
    if (event) {
      await this.addEvent(new MoveEvent(eventSource))
    }

    this.changeRow(row)

    await delay(
      CombatParticipant.movementAnimationDuration + CombatParticipant.movementAnimationDelay
    )
  }

  @action spendActionPoint(value: number = 1) {
    this.actionPoints = Math.max(this.actionPoints - value, 0)
  }

  @action addActionPoints(value: number = 1) {
    this.actionPoints = Math.max(this.actionPoints + value, 0)
  }

  @action resetActionPoints() {
    this.actionPoints = this.maxActionPoints
  }

  @action removeUpcomingTurns = () => {
    const start = this.turns.findIndex(turn => !turn.hasPassed && !turn.isCurrent)

    if (start > -1) {
      this.turns.splice(start, 9999999)
    }
  }

  @computed({ keepAlive: true }) get availableCombatAttackSets() {
    return this.combatAttackSets.filter(combatAttackSet => combatAttackSet.available)
  }

  hasAvailableCombatActionsOfType = (type: TCombatActionType) => {
    return !!this.usableCombatActions.filter(combatAction => combatAction.type === type).length
  }

  hasCombatAction(predicate: (combatAction: G['CombatAction']) => boolean) {
    return Boolean(this.combatActions.find(predicate))
  }

  automateTurn = () => this.behavior.performTurn()

  get usableCombatAttackSets(): G['CombatAttackSet'][] {
    return this.combatAttackSets.filter(combatAttackSet => combatAttackSet.usable)
  }

  static getRangedCombatAttack = <T extends CombatAttackSet = CombatAttackSet>(
    combatAttackSets: T[]
  ) => {
    return combatAttackSets.find(combatAttackSet =>
      combatAttackSet.availableAttacks.find(combatAttack => combatAttack.ranged)
    )
  }

  static movementAnimationDuration = 750
  static movementAnimationDelay = 250
  static movementAdvantageCost = 1000

  static findClosestRowTo(row: number, rows: number[]) {
    return rows.sort((a, b) => Math.abs(row - a) - Math.abs(row - b))[0]
  }

  /**
   * The initial turn delay, i.e. the initiative of the participant.
   * It's divided by 1000 in order to get a value similar to a regular
   * turn interval.
   *
   * The random component is added to the initiative to avoid having
   * the turn order be completely predictable.
   */
  static initialTurnDelay = (turnInterval: number, initiative: number) => {
    const randomComponent = Math.random() * (turnInterval * 0.05)

    return Math.round(
      turnInterval / initiative + (Math.random() > 0.5 ? randomComponent : -randomComponent)
    )
  }
}

export default CombatParticipant
