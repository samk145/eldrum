import { type TCombatActionId } from '~demo/models/combat/combat-actions'
import { DemoItem } from './item'
import { BargainItem } from '@actnone/eldrum-engine/models'

export class DemoBargainItem extends BargainItem implements DemoItem {
  combatActions?: TCombatActionId[]

  get suppliedCombatActionIds(): DemoItem['suppliedCombatActionIds'] {
    return DemoItem.suppliedCombatActionIds(this)
  }
}
