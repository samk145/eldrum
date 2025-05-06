import type { EditorAttack } from '@actnone/eldrum-editor/dist/types'
import type { TParticleEffectInput } from '../../combat/combat-particle'

import { randomIntegerFromInterval } from '../../../helpers/misc'

type TDamageCalculation = (attack: EditorAttack) => Damage

export abstract class Attack<TAttack extends EditorAttack = EditorAttack> {
  constructor(
    protected attack: TAttack,
    protected damageCalculators: {
      melee: TDamageCalculation
      ranged: TDamageCalculation
    }
  ) {}

  abstract particleEffects: TParticleEffectInput[]

  get ranged() {
    return this.attack.ranged
  }

  get baseDamage() {
    return this.attack.damage
  }

  get damage() {
    const { damageCalculators, attack, ranged } = this

    if (ranged) {
      return damageCalculators.ranged(attack)
    } else {
      return damageCalculators.melee(attack)
    }
  }

  getDamageRng = () => {
    return Attack.damageRng(this.damage)
  }

  abstract available: boolean

  static damageRng(damage: Damage) {
    return randomIntegerFromInterval(damage.min, damage.max)
  }

  /**
   * Merges multiple damage objects
   *
   * @param {array} damageObjects
   * @param {number} damageObjects[*].min
   * @param {number} damageObjects[*].max
   *
   * @return {object} damageObject
   */
  static sumDamage(damageObjects: Damage[] = []) {
    return damageObjects.reduce(
      (total, damageObject) => {
        total.min += damageObject.min
        total.max += damageObject.max
        return total
      },
      {
        min: 0,
        max: 0
      }
    )
  }
}

export default Attack
