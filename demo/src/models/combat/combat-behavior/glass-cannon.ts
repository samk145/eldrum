import { DemoCombatBehavior } from './combat-behavior'

export class GlassCannon extends DemoCombatBehavior {
  static id = 'glassCannon' as const
  id = GlassCannon.id
  startingStance = 'aggressive' as const

  get hasTeamMemberInFront() {
    return !!this.participant.aliveTeamMembers.find(teamMember => teamMember.distanceToTarget === 1)
  }

  actions = [
    async () => {
      if (
        (this.participant.distanceToTarget > 1 && this.hasTeamMemberInFront) ||
        this.numberOfActionsBeforeTarget > 1
      ) {
        return await this.tryChangeStance(this.startingStance)
      }

      return false
    },
    async () => {
      const { participant } = this

      if (participant.distanceToTarget === 1 && participant.hasAvailableRangedAttack) {
        return await this.tryMoveAwayFromTarget()
      }

      return false
    },
    async () => {
      const { participant } = this

      if (this.hasTeamMemberInFront && !participant.hasAvailableRangedAttack) {
        return await this.tryMoveTowardsTarget()
      }

      return false
    },
    this.tryAvailableCombatAction,
    this.tryAttack
  ]
}
