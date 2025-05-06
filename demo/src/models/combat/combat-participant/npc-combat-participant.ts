import { computed } from 'mobx'
import {
  NpcCombatParticipant,
  type INpcCombatParticipantGenerics,
  type TCombatEvent
} from '@actnone/eldrum-engine/models'
import type { DemoNpc } from '~demo/models/character/npc'
import {
  type TCombatAction,
  factory as combatActionFactory
} from '~demo/models/combat/combat-actions'
import { factory as combatBehaviorFactory } from '../combat-behavior'
import { DemoNpcCombatAttackSet } from '../combat-attack-set'
import type { DemoCombat } from '../combat'
import type { TDemoCombatBehavior } from '../combat-behavior'

interface IDemoNpcCombatParticipantGenerics extends INpcCombatParticipantGenerics {
  Actor: DemoNpc
  Combat: DemoCombat
  CombatAction: TCombatAction
  CombatAttackSet: DemoNpcCombatAttackSet
  CombatBehavior: TDemoCombatBehavior
  CombatEvent: TCombatEvent
  CombatParticipant: DemoNpcCombatParticipant
}

export class DemoNpcCombatParticipant extends NpcCombatParticipant<IDemoNpcCombatParticipantGenerics> {
  constructor(
    row: number,
    healthLimit: number | null,
    actor: IDemoNpcCombatParticipantGenerics['Actor'],
    combat: IDemoNpcCombatParticipantGenerics['Combat']
  ) {
    super(row, healthLimit, actor, combat)

    if (actor.behavior) {
      this.behavior = this.createCombatBehavior()

      if (this.behavior.startingStance) {
        this.changeStance(this.behavior.startingStance, false)
      }
    }
  }

  createCombatBehavior() {
    return combatBehaviorFactory(this, this.actor.behavior)
  }

  behavior: TDemoCombatBehavior = this.createCombatBehavior()

  @computed({ keepAlive: true }) get combatAttackSets(): DemoNpcCombatAttackSet[] {
    return this.actor.attacks.attackSets.map(
      attackSet => new DemoNpcCombatAttackSet(this, attackSet)
    )
  }

  @computed({ keepAlive: true }) get baseCombatActions(): TCombatAction[] {
    return this.actor.combatActions.map(action => combatActionFactory(action, this))
  }

  @computed({ keepAlive: true }) get attackCombatActions() {
    return this.combatAttackSets.reduce((actions: TCombatAction[], combatAttackSet) => {
      combatAttackSet.combatActions.forEach(combatAction => {
        actions.push(combatAction)
      })

      return actions
    }, [])
  }

  @computed({ keepAlive: true }) get combatActions() {
    return this.attackCombatActions.concat(this.baseCombatActions)
  }
}
