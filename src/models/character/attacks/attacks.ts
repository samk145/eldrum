import type { EditorItemAttack } from '@actnone/eldrum-editor/dist/types'
import type { Actor } from '../actor'
import type { Attack } from './attack'
import type { StatModifier } from '../stat-modifier'

import { computed } from 'mobx'
import { averageValue } from '../../../helpers/misc'
import Stat from '../stat'

export abstract class Attacks<TActor extends Actor = Actor, TAttackType extends Attack = Attack> {
  constructor(protected actor: TActor) {}
  abstract get attackSets(): TAttackType[][]

  @computed get meleeBooster(): number {
    return this.calculateMeleeBooster(this.actor)
  }

  calculateMeleeBooster(actor: TActor): number {
    return actor.strength / 8
  }

  calculateMeleeDamage = (attack: EditorItemAttack): Damage => {
    const booster = this.meleeBooster
    return Attacks.calculateDamage('meleeDamage', booster, attack.damage, this.actor.statModifiers)
  }

  @computed get rangedBooster(): number {
    return this.calculateRangedBooster(this.actor.perception)
  }

  calculateRangedBooster = (perception: number): number => {
    return perception * 2
  }

  calculateRangedDamage = (attack: EditorItemAttack): Damage => {
    const booster = this.rangedBooster
    return Attacks.calculateDamage('rangedDamage', booster, attack.damage, this.actor.statModifiers)
  }

  static calculateDamage(
    selector: string,
    booster: number,
    initialDamage: Damage,
    statModifiers: StatModifier[]
  ) {
    const damage = {
      min: initialDamage.min + booster,
      max: initialDamage.max + booster
    }

    return Attacks.roundDamage(
      statModifiers
        .filter(statModifier => statModifier.statName === selector)
        .reduce(
          (currentValue, statModifier) =>
            Attacks.reduceDamageStatModifiers(damage, currentValue, statModifier),
          damage
        )
    )
  }

  static reduceDamageStatModifiers = (
    initialDamage: Damage,
    damage: Damage,
    statModifier: StatModifier
  ): Damage => {
    const newMin = Stat.statModifierReduceFn(initialDamage.min, damage.min, statModifier)
    const newMax = Stat.statModifierReduceFn(initialDamage.max, damage.max, statModifier)

    return {
      min: newMin,
      max: newMax
    }
  }

  static roundDamage = (damage: Damage): Damage => {
    return {
      min: Math.round(damage.min),
      max: Math.round(damage.max)
    }
  }

  getPrimaryMeleeAttack<T extends EditorItemAttack | Attack = EditorItemAttack>(attackSets: T[][]) {
    const meleeAttacks = attackSets.reduce((attacks, attackSet) => {
      return attacks.concat(attackSet.filter(attack => !attack.ranged))
    }, [])

    const meleeAttacksSortedByDamage = this.getStrongestAttack(meleeAttacks)

    return meleeAttacksSortedByDamage.length ? meleeAttacksSortedByDamage[0] : null
  }

  getPrimaryRangedAttack<T extends EditorItemAttack | Attack = EditorItemAttack>(
    attackSets: T[][]
  ) {
    const rangedAttacks = attackSets.reduce((attacks, attackSet) => {
      return attacks.concat(attackSet.filter(attack => attack.ranged))
    }, [])

    const rangedAttacksSortedByDamage = this.getStrongestAttack(rangedAttacks)

    return rangedAttacksSortedByDamage.length ? rangedAttacksSortedByDamage[0] : null
  }

  getStrongestAttack = <T extends EditorItemAttack | Attack = EditorItemAttack>(attacks: T[]) => {
    return attacks.sort((a, b) =>
      averageValue([a.damage.min, a.damage.max]) > averageValue([b.damage.min, b.damage.max])
        ? -1
        : 1
    )
  }

  @computed get primaryMeleeAttack() {
    return this.getPrimaryMeleeAttack(this.attackSets)
  }

  @computed get primaryRangedAttack() {
    return this.getPrimaryRangedAttack(this.attackSets)
  }

  @computed get canAttackRanged() {
    return !!(this.primaryRangedAttack && this.primaryRangedAttack.available)
  }
}
