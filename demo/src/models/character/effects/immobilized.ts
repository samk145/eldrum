import type { TDemoCombatParticipant } from '~demo/models/combat/combat-participant'
import { DemoEffect } from './effect'

class Immobilized extends DemoEffect {
  static id = 'immobilized' as const
  id = Immobilized.id
  preventsMovementInCombat = true

  postCombatTurn = (_: TDemoCombatParticipant) =>
    new Promise<void>(resolve => {
      this.use()
      resolve()
    })

  postCombat = (_: TDemoCombatParticipant) => this.remove()
}

export default Immobilized
