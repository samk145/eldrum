import { action, computed } from 'mobx'
import type { TUuid } from '../../helpers/misc'
import type { TAttack } from '../character/attacks/t-attack'
import type { TCharacterAttackSet } from '../character/attacks/character-attack'
import type { TNpcAttackSet } from '../character/attacks/npc-attack'
import { randomFromList, uuid } from '../../helpers/misc'
import {
  type CombatParticipant,
  type PlayerCombatParticipant,
  type NpcCombatParticipant,
  type TCombatParticipant
} from './combat-participant'
import type { CombatAttack, PlayerCombatAttack, NpcCombatAttack } from './combat-attack'

export type TCombatAttackSet = PlayerCombatAttackSet | NpcCombatAttackSet

export interface ICombatAttackSetGenerics {
  Possessor: CombatParticipant
  AttackSet: TAttack[]
  CombatAttack: CombatAttack
}

export abstract class CombatAttackSet<
  G extends ICombatAttackSetGenerics = ICombatAttackSetGenerics
> {
  constructor(
    protected possessor: G['Possessor'],
    protected attackSet: G['AttackSet']
  ) {}

  id: TUuid = uuid()

  abstract combatAttacks: G['CombatAttack'][]

  @computed get available() {
    return this.availableAttacks.length > 0
  }

  @computed get usable() {
    return this.usableAttacks.length > 0
  }

  @computed get usableAttacks() {
    return this.combatAttacks.filter(combatAttack => combatAttack.usable)
  }

  @computed get availableAttacks() {
    return this.combatAttacks.filter(combatAttack => combatAttack.available)
  }

  @action useRandomUsableAttack = async (target?: TCombatParticipant) => {
    const randomAttack = randomFromList(this.usableAttacks)

    if (randomAttack) {
      await randomAttack.use(target)
    }
  }
}

export interface IPlayerCombatAttackSetGenerics extends ICombatAttackSetGenerics {
  Possessor: PlayerCombatParticipant
  AttackSet: TCharacterAttackSet
  CombatAttack: PlayerCombatAttack
}

export abstract class PlayerCombatAttackSet<
  G extends IPlayerCombatAttackSetGenerics = IPlayerCombatAttackSetGenerics
> extends CombatAttackSet<G> {
  get source() {
    return this.attackSet[0].item
  }
}

export interface INpcCombatAttackSetGenerics extends ICombatAttackSetGenerics {
  Possessor: NpcCombatParticipant
  AttackSet: TNpcAttackSet
  CombatAttack: NpcCombatAttack
}

export abstract class NpcCombatAttackSet<
  G extends INpcCombatAttackSetGenerics = INpcCombatAttackSetGenerics
> extends CombatAttackSet<G> {}

export default CombatAttackSet
