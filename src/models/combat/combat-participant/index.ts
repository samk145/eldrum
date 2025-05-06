import type { CombatParticipant } from './combat-participant'
import type { PlayerCombatParticipant } from './player-combat-participant'
import type { NpcCombatParticipant } from './npc-combat-participant'

export * from './combat-participant'
export * from './player-combat-participant'
export * from './npc-combat-participant'

export type TCombatParticipant = PlayerCombatParticipant | NpcCombatParticipant | CombatParticipant

export type TCombatParticipants = [
  PlayerCombatParticipant,
  NpcCombatParticipant,
  ...NpcCombatParticipant[]
]
