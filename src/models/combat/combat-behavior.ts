import type { TCombatActionType } from './combat-action'
import type { TCombatParticipant } from './combat-participant'
import { clampBetween, delay } from '../../helpers/misc'

export interface ICombatBehaviorGenerics {
  Participant: TCombatParticipant
  ActionName: string
}

export type TCombatBehaviorAction<TActionName extends string, TParticipant> = {
  sort?: (target: TParticipant) => number
  condition?: (target: TParticipant) => boolean
  name: TActionName
}

export abstract class CombatBehavior<G extends ICombatBehaviorGenerics = ICombatBehaviorGenerics> {
  constructor(protected participant: G['Participant']) {}

  abstract readonly id: string
  abstract actions: (() => Promise<boolean>)[]

  get combatActionPreference(): TCombatBehaviorAction<G['ActionName'], any>[] {
    return []
  }

  startingStance?: string

  get individualDelay() {
    return clampBetween(this.participant.speedMs / 4, 125, 500)
  }

  get preTurnDelay() {
    return clampBetween(this.individualDelay, 300, 450)
  }

  get postTurnDelay() {
    return Math.min(this.individualDelay * 3, 500)
  }

  get postActionDelay() {
    return (100 + this.individualDelay) * 2
  }

  get hasTeamMemberInFront() {
    return !!this.participant.aliveTeamMembers.find(teamMember => teamMember.distanceToTarget === 1)
  }

  async performTurn() {
    const { participant, actions } = this

    let performedAction = false

    await delay(this.preTurnDelay)

    while (participant.actionPoints > 0) {
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i]

        if (!participant.isAlive) {
          return
        }

        if (participant.actionPoints > 0) {
          try {
            performedAction = await action()

            if (performedAction) {
              i = -1
              continue
            }
          } catch (error) {
            performedAction = false
          }
        } else {
          break
        }
      }

      if (!performedAction) {
        participant.spendActionPoint()
      }
    }

    if (!performedAction) {
      await participant.hold()
      await delay(this.postActionDelay)
    }

    await delay(this.postTurnDelay)
  }

  async tryChangeStance(stance: string) {
    const { participant, postActionDelay } = this

    if (!participant.actor.effects.hasEffect(stance)) {
      await participant.performAction(() => participant.changeStance(stance))
      await delay(postActionDelay)
      return true
    } else {
      return false
    }
  }

  async tryMoveTowardsTarget() {
    const { participant } = this

    if (participant.canMoveTowardsTarget) {
      await participant.moveTowardsTargetAsAction()
      return true
    } else {
      return false
    }
  }

  async tryMoveAwayFromTarget() {
    const { participant } = this

    if (participant.canMoveAwayFromTarget) {
      await participant.moveAwayFromTargetAsAction(0)
      return true
    } else {
      return false
    }
  }

  tryRandomPreferredAvailableCombatActions(
    type: TCombatActionType,
    preferencePercentage: number = 1
  ) {
    const { participant } = this
    const chance = Math.random()

    if (
      participant.canUseCombatAction &&
      participant.hasAvailableCombatActionsOfType(type) &&
      preferencePercentage >= chance
    ) {
      return this.tryRandomAvailableCombatAction(combatAction => combatAction.type === type)
    } else {
      return this.tryRandomAvailableCombatAction()
    }
  }

  async tryRandomAvailableCombatAction(
    filter?: (combatAction: G['Participant']['combatActions'][number]) => boolean
  ) {
    const { participant, postActionDelay } = this

    if (participant.canUseCombatAction) {
      if (participant.usableCombatActions.length) {
        await participant.useRandomUsableCombatAction(filter)
        await delay(postActionDelay)
      }

      return true
    }

    return false
  }

  tryAvailableCombatAction = async () => {
    const { participant, postActionDelay } = this

    if (participant.canUseCombatAction) {
      if (participant.combatActionsThatFulfillNonAdvantageReq.length) {
        const combatActionPreferences = this.getPreferredCombatActions()

        for (let i = 0; i < combatActionPreferences.length; i++) {
          const combatActionPreference = combatActionPreferences[i]

          const usableCombatAction = this.participant.usableCombatActions.find(
            combatAction => combatAction.id === combatActionPreference.name
          )

          if (usableCombatAction) {
            await this.participant.performAction(usableCombatAction.use)
            await delay(postActionDelay)
            return true
          }
        }
      }
    }

    return false
  }

  /*
   * Gets the id of the currently preferred combat action to use
   * based on combat actions that are available (but not necessarily usable)
   */
  protected getPreferredCombatActions = () => {
    const { participant, combatActionPreference } = this
    const filteredCombatActionPreferenceList = combatActionPreference.filter(
      combatBehaviorCombatAction => {
        if (
          !participant.hasCombatAction(
            ca => ca.id === combatBehaviorCombatAction.name && ca.fulfillsNonAdvantageRequirements
          )
        ) {
          return false
        }

        if (combatBehaviorCombatAction.condition) {
          return combatBehaviorCombatAction.condition(participant.target)
        }

        return true
      }
    )

    const combatActionPreferenceOrder = CombatBehavior.sortActions<
      G['Participant'],
      G['ActionName']
    >(participant.target, filteredCombatActionPreferenceList)

    return combatActionPreferenceOrder
  }

  tryAttack = async () => {
    const { participant, postActionDelay } = this

    if (participant.canAttack) {
      await participant.useRandomUsableCombatAttackSet()
      await delay(postActionDelay)
      return true
    }

    return false
  }

  get turnsBeforeTarget() {
    const { participant } = this
    const { target } = participant

    return Math.floor(target.turnInterval / participant.turnInterval)
  }

  get numberOfActionsBeforeTarget() {
    const { participant } = this

    return participant.actionPoints + this.turnsBeforeTarget * participant.maxActionPoints
  }

  /**
   * Sorts available actions based on two sorting orders:
   *
   * 1. The action's sorting function
   * 2. The original position in the array
   *
   * This means that if two different actions want to be moved up in the list,
   * the one that's already higher will remain higher.
   *
   * @param actions - A list of items to be sorted.
   * @return A new array containing the sorted actions
   */
  static sortActions = <
    TParticipant extends TCombatParticipant = TCombatParticipant,
    T extends string = string
  >(
    target: TParticipant,
    actions: TCombatBehaviorAction<T, TParticipant>[]
  ) => {
    return [...actions].sort((a, b) => {
      let sortValue = 0

      if (a.sort && b.sort) {
        sortValue = actions.indexOf(a) - actions.indexOf(b)
      } else if (a.sort) {
        sortValue = a.sort(target)
      } else if (b.sort) {
        sortValue = -b.sort(target)
      }

      return sortValue
    })
  }
}

export default CombatBehavior
