import { DemoCombatBehavior } from './combat-behavior'

export class Tank extends DemoCombatBehavior {
  static id = 'tank' as const
  id = Tank.id
  startingStance = 'defensive' as const

  actions = [
    () => this.tryChangeStance(this.startingStance),
    async () => (!this.participant.canAttack ? await this.tryMoveTowardsTarget() : false),
    this.tryAvailableCombatAction,
    this.tryAttack
  ]
}
