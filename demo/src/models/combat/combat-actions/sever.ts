import { computed } from 'mobx'
import { CombatParticleModifier, AttackCombatAction } from '@actnone/eldrum-engine/models'
import { DemoAttackCombatAction } from './combat-action'
import { type TDemoCombatAttack } from '../combat-attack'
import { type TDemoCombatParticipant } from '../combat-participant'

class Sever extends DemoAttackCombatAction {
  constructor(participant: TDemoCombatParticipant, combatAttack: TDemoCombatAttack) {
    super(participant, combatAttack)

    this.particleModifiers.push(
      new CombatParticleModifier('damage', 'factor', 4),
      new CombatParticleModifier('criticalHitDamageFactor', 'factor', 2)
    )
  }

  static id = 'sever' as const
  static cost = 3000
  id = Sever.id
  cost = Sever.cost

  @computed get fulfillsNonAdvantageRequirements() {
    const { combatAttack, participant } = this

    if (
      AttackCombatAction.passesUsabilityChecks(combatAttack) &&
      Sever.hasReachedLowHealth(participant.target)
    ) {
      return true
    }

    return false
  }

  static hasReachedLowHealth = (target: TDemoCombatParticipant) => {
    return target.actor.healthPercentage <= 0.35
  }
}

export default Sever
