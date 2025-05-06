import { DemoCombatBehavior } from './combat-behavior'

export class Unstoppable extends DemoCombatBehavior {
  static id = 'unstoppable' as const
  id = Unstoppable.id
  startingStance = 'aggressive' as const

  actions = [
    () => this.tryChangeStance(this.startingStance),
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
    this.tryAvailableCombatAction,
    this.tryAttack
  ]
}
