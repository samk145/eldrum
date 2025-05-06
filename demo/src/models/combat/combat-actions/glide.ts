import { action, computed } from 'mobx'
import { DemoOffensiveCombatAction } from './combat-action'

class Glide extends DemoOffensiveCombatAction {
  static id = 'glide' as const
  static cost = 0
  cost = Glide.cost
  id = Glide.id

  @action use = async () => {
    const { participant } = this
    this.preUse()

    const advantagePointsFromTarget = Math.min(
      Glide.advantageToRemove,
      participant.target.advantagePoints
    )

    participant.target.removeAdvantagePoints(advantagePointsFromTarget)
    participant.addAdvantagePoints(advantagePointsFromTarget)

    participant.target.actor.effects.removeEffectsById('parry')
  }

  @computed get fulfillsNonAdvantageRequirements() {
    return this.isWithinRange && this.participant.target.advantagePoints > 0
  }

  get isWithinRange() {
    return this.participant.distanceToTarget === 1
  }

  static advantageToRemove = 1500
}

export default Glide
