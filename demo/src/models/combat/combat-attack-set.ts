import { computed } from 'mobx'
import {
  NpcCombatAttackSet,
  PlayerCombatAttackSet,
  type INpcCombatAttackSetGenerics,
  type IPlayerCombatAttackSetGenerics
} from '@actnone/eldrum-engine/models'
import {
  type TDemoCombatAttack,
  DemoPlayerCombatAttack,
  DemoNpcCombatAttack
} from './combat-attack'
import type { TCombatAction } from '~demo/models/combat/combat-actions'
import type { DemoCharacterAttack, DemoNpcAttack } from '../character/attacks'
import type { DemoPlayerCombatParticipant, DemoNpcCombatParticipant } from './combat-participant'

const getCombatActions = (combatAttacks: TDemoCombatAttack[]) => {
  return combatAttacks.reduce((combatActions: TCombatAction[], combatAttack) => {
    combatAttack.combatActions.forEach(combatAction => {
      combatActions.push(combatAction)
    })

    return combatActions
  }, [])
}

interface IDemoPlayerCombatAttackSetGenerics extends IPlayerCombatAttackSetGenerics {
  Possessor: DemoPlayerCombatParticipant
  AttackSet: DemoCharacterAttack[]
  CombatAttack: DemoPlayerCombatAttack
}

export class DemoPlayerCombatAttackSet extends PlayerCombatAttackSet<IDemoPlayerCombatAttackSetGenerics> {
  @computed get combatActions(): TCombatAction[] {
    return getCombatActions(this.combatAttacks)
  }

  @computed({ keepAlive: true }) get combatAttacks(): DemoPlayerCombatAttack[] {
    return this.attackSet.map(attack => new DemoPlayerCombatAttack(this.possessor, attack))
  }
}

interface IDemoNpcCombatAttackSetGenerics extends INpcCombatAttackSetGenerics {
  Possessor: DemoNpcCombatParticipant
  AttackSet: DemoNpcAttack[]
  CombatAttack: DemoNpcCombatAttack
}

export class DemoNpcCombatAttackSet extends NpcCombatAttackSet<IDemoNpcCombatAttackSetGenerics> {
  @computed get combatActions(): TCombatAction[] {
    return getCombatActions(this.combatAttacks)
  }

  @computed({ keepAlive: true }) get combatAttacks(): DemoNpcCombatAttack[] {
    return this.attackSet.map(attack => new DemoNpcCombatAttack(this.possessor, attack))
  }
}
