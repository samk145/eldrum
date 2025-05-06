import type { CombatParticle, StatModifier } from '@actnone/eldrum-engine/models'
import { DemoEffect } from './effect'
import { type TDemoCombatParticipant } from '~demo/models/combat/combat-participant'

class Incapacitated extends DemoEffect {
  static id = 'incapacitated' as const
  id = Incapacitated.id
  uses = 1
  preventsMovementInCombat = true
  statModifiers: StatModifier[] = [
    {
      statName: 'speed',
      type: 'factor',
      value: 0.75
    }
  ]

  preReceiveCombatParticle = async (
    _: TDemoCombatParticipant,
    __: TDemoCombatParticipant,
    particle: CombatParticle
  ) => {
    particle.addModifier('chanceToEvade', 'set', 0)
    particle.addModifier('damage', 'factor', 2)
  }

  preCombatTurn = async () => {
    this.use()
  }

  postCombat = () => this.remove()
}

export default Incapacitated
