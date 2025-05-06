import { type TCombatActionId } from '~demo/models/combat/combat-actions'
import { CharacterItem } from '@actnone/eldrum-engine/models'
import { DemoItem } from './item'

export class DemoCharacterItem extends CharacterItem implements DemoItem {
  combatActions?: TCombatActionId[]

  get suppliedCombatActionIds(): DemoItem['suppliedCombatActionIds'] {
    return DemoItem.suppliedCombatActionIds(this)
  }
}
