import type Npc from '../npc'
import { Attacks } from './attacks'
import type NpcAttack from './npc-attack'

export class NpcAttacks<TNpcAttack extends NpcAttack = NpcAttack> extends Attacks<Npc, TNpcAttack> {
  attackSets: TNpcAttack[][] = []
}
