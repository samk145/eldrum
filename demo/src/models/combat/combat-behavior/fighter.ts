import { DemoCombatBehavior } from './combat-behavior'

export class Fighter extends DemoCombatBehavior {
  static id = 'fighter' as const
  id = Fighter.id

  actions = [
    async () => {
      if (this.participant.healthPercentageIs('below', 0.5)) {
        return await this.tryChangeStance('defensive')
      } else if (
        this.numberOfActionsBeforeTarget > 1 &&
        this.participant.target.healthPercentageIs('below', 0.5)
      ) {
        return await this.tryChangeStance('aggressive')
      }

      return false
    },
    async () => {
      const { participant } = this

      if (
        participant.healthPercentageIs('below', 0.25) &&
        participant.hasAvailableRangedAttack &&
        participant.distanceToTarget === 1 &&
        this.numberOfActionsBeforeTarget > 1
      ) {
        return await this.tryMoveAwayFromTarget()
      }

      return false
    },
    async () => {
      if (
        this.participant.canAttack ||
        this.participant.hasAvailableCombatActionsOfType('offensive')
      ) {
        return false
      } else {
        return await this.tryMoveTowardsTarget()
      }
    },
    () => this.tryAvailableCombatAction(),
    () => this.tryAttack()
  ]
}
