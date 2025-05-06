import { type TDemoCombatParticipant } from '~demo/models/combat/combat-participant'
import { DemoEffect } from './effect'
import { BleedEvent } from '@actnone/eldrum-engine/models'

const DELAY = 750

class Bleeding extends DemoEffect {
  static id = 'bleeding' as const
  id = Bleeding.id
  uses = 3
  stackable = true

  get damagePerTurn(): number {
    const { possessor } = this

    return Bleeding.calculateBleedDamage(possessor.maxHealth, possessor.resilience)
  }

  preCombatTurn = async (participant: TDemoCombatParticipant) => {
    const { damagePerTurn } = this

    participant.takeDamage(damagePerTurn)
    await participant.addEvent(new BleedEvent(-damagePerTurn), DELAY)
    this.use()
  }

  postCombat = () => this.remove()

  static calculateBleedDamage(maxHealth: number, resilience: number) {
    return Math.ceil(maxHealth / (15 + Bleeding.resilienceReducer(resilience)))
  }

  static resilienceReducer(resilience: number) {
    return Math.max(resilience - 1, 0)
  }
}

export default Bleeding
