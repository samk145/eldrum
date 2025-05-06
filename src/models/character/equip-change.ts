import type { StatNames } from './stats'
import type CharacterItem from '../item/character-item'

export type TEquipChanges = {
  [key in StatNames]?: EquipChange
} & {
  armor: EquipChange
  maxEncumbrance: EquipChange
  encumbrance: EquipChange
  willUnEquip: CharacterItem[]
  canEquip: boolean
}

export class EquipChange {
  constructor(
    public fromValue: number,
    public toValue: number
  ) {}

  get wouldChange() {
    return this.fromValue !== this.toValue
  }

  get isIncrease() {
    if (this.toValue > this.fromValue) {
      return true
    } else if (this.fromValue > this.toValue) {
      return false
    }

    return null
  }

  get changeInPercentage() {
    return this.toValue / this.fromValue
  }
}
