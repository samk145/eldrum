import type { DemoPlayerCombatParticipant } from './player-combat-participant'
import type { DemoNpcCombatParticipant } from './npc-combat-participant'

export * from './player-combat-participant'
export * from './npc-combat-participant'

export type TDemoCombatParticipant = DemoPlayerCombatParticipant | DemoNpcCombatParticipant

export type TDemoCombatParticipants = [
  DemoPlayerCombatParticipant,
  DemoNpcCombatParticipant,
  ...DemoNpcCombatParticipant[]
]
