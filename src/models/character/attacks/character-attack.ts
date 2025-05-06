import type { EditorItemAttack } from '@actnone/eldrum-editor/dist/types'
import { computed, action } from 'mobx'
import type { CharacterItem } from '../../item'
import { Attack } from './attack'
import type { CharacterAttacks } from './character-attacks'
import type { Inventory } from '../inventory'
import type { TParticleEffectInput } from '../../combat'

export type TCharacterAttackSet = CharacterAttack[]

export class CharacterAttack<
  TEditorItemAttack extends EditorItemAttack = EditorItemAttack
> extends Attack<TEditorItemAttack> {
  constructor(
    protected inventory: Inventory,
    attacks: CharacterAttacks,
    attack: TEditorItemAttack,
    public item?: CharacterItem
  ) {
    super(attack, { melee: attacks.calculateMeleeDamage, ranged: attacks.calculateRangedDamage })
  }

  particleEffects: TParticleEffectInput[] = []

  /**
   * Uses Ammunition
   *
   * If the attack is based on an item, the value will reflect whether it uses ammunition or not.
   * An item that does not use ammunition is considered a throwable weapon. Will be undefined if
   * the attack isn't ranged.
   */
  get usesAmmunition() {
    if (this.ranged && this.item) {
      return !!this.item.rangedAmmunition
    } else if (!this.ranged) {
      return false
    }

    return undefined
  }

  get ammunitionQuantity() {
    if (this.ranged && this.item) {
      const itemId = this.item.rangedAmmunition ? this.item.rangedAmmunition : this.item._id

      return this.inventory.getItemQuantity(itemId)
    }
  }

  @computed get available() {
    return !!(!this.ranged || (this.ranged && this.item && this.ammunitionQuantity))
  }

  @action disposeAmmunition = (notify: boolean = true) => {
    const { inventory, item, ranged } = this

    if (item && ranged) {
      if (item.rangedAmmunition) {
        inventory.removeItemById(item.rangedAmmunition, { notify })
      } else {
        inventory.removeItemByUuid(item.uuid, { notify })
      }
    }
  }
}

export default CharacterAttack
