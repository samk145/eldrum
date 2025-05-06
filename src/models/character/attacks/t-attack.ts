import type CharacterAttack from './character-attack'
import type NpcAttack from './npc-attack'

type TAttack = CharacterAttack | NpcAttack
type TAttackSet = TAttack[]
type TAttackSets = TAttackSet[]

export type { TAttack, TAttackSet, TAttackSets }
