import type {
  EditorItem,
  EditorItemBase,
  EditorAction,
  EditorItemAttack
} from '@actnone/eldrum-editor/dist/types'
import type { Slot } from '../character/inventory'
import type { Effect } from '../character/effect'
import type SaveDataItem from '../database/schemas/save/save-data/save-data-item'
import type { TUuid } from '../../helpers/misc'
import { type StatModifier } from '../character/stat-modifier'
import { t } from '../../i18n'

interface ItemChange {
  id: string
  name: string
  count: number
}

type ItemAttackSet = EditorItemAttack[]
type TSlotSet = Slot[]
type TSlotSets = TSlotSet[]

interface ItemSideEffects {
  statModifiers: StatModifier[]
  onEquip?: EditorAction[]
  onUnEquip?: EditorAction[]
  immunities?: Effect['id'][]
}

interface ItemConsumption {
  uses: number
  actions: EditorAction[]
}

interface Item extends EditorItemBase {
  uuid: TUuid
  slotSets?: TSlotSets
  attackSet?: ItemAttackSet
  sideEffects?: ItemSideEffects
  encumbrance: number
  rangedAmmunition?: string
  traits?: string[]
  armor?: number
  blockChance?: number
  consumption?: ItemConsumption
  scripture?: string
}

class Item {
  constructor(defaultProps: EditorItem, storedProps?: Partial<SaveDataItem>) {
    Object.assign(this, defaultProps)

    if (storedProps) {
      Object.assign(this, storedProps)
    }
  }

  get name() {
    return t(`ITEM-${this._id}-NAME`, { ns: 'items' })
  }

  private set name(_: string) {}

  get description() {
    return t(`ITEM-${this._id}-DESC`, { ns: 'items' })
  }

  private set description(_: string) {}

  get meleeAttack() {
    return this.attackSet ? this.attackSet.find(attack => !attack.ranged) : undefined
  }

  get rangedAttack() {
    return this.attackSet ? this.attackSet.find(attack => attack.ranged) : undefined
  }
}

export type { ItemAttackSet, ItemChange, TSlotSet, TSlotSets }
export { Item }
export default Item
