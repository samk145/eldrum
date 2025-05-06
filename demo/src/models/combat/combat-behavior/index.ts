import type { DemoNpcCombatParticipant } from '../combat-participant'
import { Tank } from './tank'
import { Fighter } from './fighter'
import { Unstoppable } from './unstoppable'
import { GlassCannon } from './glass-cannon'

const behaviorIds = [Tank.id, Fighter.id, Unstoppable.id, GlassCannon.id] as const

export type TCombatBehaviorId = (typeof behaviorIds)[number]
export type TDemoCombatBehavior = Tank | Fighter | Unstoppable | GlassCannon

export const factory = (participant: DemoNpcCombatParticipant, behavior: TCombatBehaviorId) => {
  switch (behavior) {
    case Tank.id:
      return new Tank(participant)
    case Fighter.id:
      return new Fighter(participant)
    case Unstoppable.id:
      return new Unstoppable(participant)
    case GlassCannon.id:
      return new GlassCannon(participant)
  }
}
