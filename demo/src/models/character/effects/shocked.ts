import type { TDemoCombatParticipant } from '~demo/models/combat/combat-participant'
import { DemoEffect } from './effect'

class Shocked extends DemoEffect {
  static id = 'shocked' as const
  id = Shocked.id
  uses = 1

  preCombatTurn = async (participant: TDemoCombatParticipant) => {
    if (participant.canMoveAwayFromTarget) {
      await participant.moveAwayFromTarget()
      participant.spendActionPoint()
    }
  }

  postCombatTurn = async () => {
    const { use } = this
    use()
  }

  postCombat = () => this.remove()
}

export default Shocked
