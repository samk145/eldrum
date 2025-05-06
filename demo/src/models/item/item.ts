import { type TCombatActionId } from '~demo/models/combat/combat-actions'
import { Item } from '@actnone/eldrum-engine/models'

export abstract class DemoItem extends Item {
  combatActions?: TCombatActionId[]
  suppliedCombatActionIds?: TCombatActionId[]

  static suppliedCombatActionIds = (item: DemoItem) => {
    return item.attackSet
      ? item.attackSet
          .reduce(
            (combatActionNames: TCombatActionId[], attack) =>
              attack.combatActions
                ? combatActionNames.concat(attack.combatActions as TCombatActionId[])
                : combatActionNames,
            []
          )
          .concat(item.combatActions || [])
      : item.combatActions
  }
}
