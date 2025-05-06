import { computed } from 'mobx'
import { logger } from '@actnone/eldrum-engine/helpers'
import { factory, type TCombatAction } from '~demo/models/combat/combat-actions'
import {
  PlayerCombatAttack,
  NpcCombatAttack,
  CombatAttack,
  type INpcCombatAttackGenerics,
  type IPlayerCombatAttackGenerics
} from '@actnone/eldrum-engine/models'

import type {
  DemoPlayerCombatParticipant,
  DemoNpcCombatParticipant,
  TDemoCombatParticipant
} from '~demo/models/combat/combat-participant'
import type { DemoNpcAttack, DemoCharacterAttack } from '../character/attacks/attack'

export type TDemoCombatAttack = DemoPlayerCombatAttack | DemoNpcCombatAttack

abstract class DemoCombatAttack extends CombatAttack {
  static buildCombatActions = (
    possessor: TDemoCombatParticipant,
    combatAttack: TDemoCombatAttack
  ) => {
    const { combatActions } = combatAttack.attack

    return combatActions
      ? combatActions.reduce((all: TCombatAction[], combatActionName) => {
          try {
            const action = factory(combatActionName, possessor, combatAttack)
            all.push(action)
          } catch (error) {
            logger.warn(error)
          }

          return all
        }, [])
      : []
  }
}

interface IDemoPlayerCombatAttackGenerics extends IPlayerCombatAttackGenerics {
  Possessor: DemoPlayerCombatParticipant
  Attack: DemoCharacterAttack
}

export class DemoPlayerCombatAttack extends PlayerCombatAttack<IDemoPlayerCombatAttackGenerics> {
  @computed({ keepAlive: true }) get combatActions(): TCombatAction[] {
    return DemoCombatAttack.buildCombatActions(this.possessor, this)
  }
}

interface IDemoNpcCombatAttackGenerics extends INpcCombatAttackGenerics {
  Possessor: DemoNpcCombatParticipant
  Attack: DemoNpcAttack
}

export class DemoNpcCombatAttack extends NpcCombatAttack<IDemoNpcCombatAttackGenerics> {
  @computed({ keepAlive: true }) get combatActions(): TCombatAction[] {
    return DemoCombatAttack.buildCombatActions(this.possessor, this)
  }
}

export default CombatAttack
