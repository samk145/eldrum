import type { TDemoCombatParticipant } from '~demo/models/combat/combat-participant'
import type { CombatParticle } from '@actnone/eldrum-engine/models'
import { ParryEvent } from '@actnone/eldrum-engine/models'
import { DemoEffect } from './effect'

const PARRY_TIME = 500

class Parry extends DemoEffect {
  static id = 'parry' as const
  id = Parry.id
  stackable = false
  uses = 1

  preReceiveCombatParticle = async (
    _: TDemoCombatParticipant,
    receiver: TDemoCombatParticipant,
    particle: CombatParticle
  ) => {
    if (
      particle.input.damage &&
      particle.input.distance === 1 &&
      !Parry.cannotBeParried.includes(particle.source)
    ) {
      receiver.addAdvantagePoints(Parry.advantageGain)
      await receiver.addEvent(new ParryEvent(), PARRY_TIME)
      this.use()
      throw new Error(this.id)
    }
  }

  preCombatTurn = async () => this.remove()

  postCombat = () => this.remove()

  static advantageGain = 2000
  static cannotBeParried: CombatParticle['source'][] = ['charge', 'swipe', 'slam']
}

export default Parry
