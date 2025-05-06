import { PlayerCombatParticipant } from '@actnone/eldrum-engine/models'
import type { TCombatEvent, IPlayerCombatParticipantGenerics } from '@actnone/eldrum-engine/models'
import type { DemoCharacterItem } from '~demo/models/item/character-item'
import {
  type TCombatAction,
  factory as combatActionFactory
} from '~demo/models/combat/combat-actions'
import type { DemoCharacter } from '~demo/models/character/character'
import { logger } from '@actnone/eldrum-engine/helpers'
import { computed } from 'mobx'
import { DemoPlayerCombatAttackSet } from '../combat-attack-set'
import { Fighter } from '../combat-behavior/fighter'
import type { DemoCombat } from '../combat'

interface IDemoPlayerCombatParticipantGenerics extends IPlayerCombatParticipantGenerics {
  Actor: DemoCharacter
  Combat: DemoCombat
  CombatAction: TCombatAction
  CombatAttackSet: DemoPlayerCombatAttackSet
  CombatBehavior: Fighter
  CombatEvent: TCombatEvent
}

export class DemoPlayerCombatParticipant extends PlayerCombatParticipant<IDemoPlayerCombatParticipantGenerics> {
  behavior = new Fighter(this)

  @computed({ keepAlive: true }) get combatAttackSets(): DemoPlayerCombatAttackSet[] {
    return this.actor.attacks.attackSets.map(
      attackSet => new DemoPlayerCombatAttackSet(this, attackSet)
    )
  }

  @computed({ keepAlive: true }) get attackCombatActions() {
    return this.combatAttackSets.reduce((actions: TCombatAction[], combatAttackSet) => {
      combatAttackSet.combatActions.forEach(combatAction => {
        if (!actions.find(a => a.id === combatAction.id)) {
          actions.push(combatAction)
        }
        return actions
      })

      return actions
    }, [])
  }

  @computed({ keepAlive: true }) get combatActions() {
    return this.attackCombatActions.concat(
      this.itemCombatActions.reduce(
        (actions: TCombatAction[], actorCombatAction) =>
          actions.concat(
            actorCombatAction.combatActions.filter(action => !actions.find(a => a.id === action.id))
          ),
        []
      )
    )
  }

  @computed({ keepAlive: true }) get itemCombatActions() {
    return this.actor.inventory.equippedItemsInHands.reduce(
      (all: { source: DemoCharacterItem; combatActions: TCombatAction[] }[], item) => {
        const combatActions: TCombatAction[] = []

        if (item.combatActions) {
          for (let i = 0; i < item.combatActions.length; i++) {
            try {
              const combatAction = combatActionFactory(item.combatActions[i], this)
              combatActions.push(combatAction)
            } catch (error) {
              logger.warn(error)
            }
          }
        }

        all.push({
          source: item,
          combatActions
        })

        return all
      },
      []
    )
  }
}
