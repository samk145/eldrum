import type Game from '../game'
import type { Attributes, TAttribute } from './attributes'
import type { StatModifier } from './stat-modifier'
import type { Stats, StatValues } from './stats'
import type { ActorEffects } from './actor-effects'
import type { Effect } from './effect'
import type { Passive } from './passive'

import { observable, computed, action } from 'mobx'
import { t } from '../../i18n'
import { IntegerAttribute } from './integer-attribute'

export interface IActorGenerics {
  Game: Game
}

interface Actor extends StatValues {
  _id: string
  armor: number
  name?: string
  alive: boolean
}

abstract class Actor<G extends IActorGenerics = IActorGenerics> {
  constructor(protected game: G['Game']) {}

  abstract blockChance: number

  @observable level = 1
  @observable health = 1

  abstract effects: ActorEffects

  @computed get strength(): number {
    return this.attributes.strength.value
  }

  set strength(value: number) {
    this.attributes.strength.setBaseValue(value)
  }

  @computed get baseStrength(): number {
    return this.attributes.strength.baseValue
  }

  @computed get charisma(): number {
    return this.attributes.charisma.value
  }

  set charisma(value: number) {
    this.attributes.charisma.setBaseValue(value)
  }

  @computed get baseCharisma(): number {
    return this.attributes.charisma.baseValue
  }

  @computed get resilience(): number {
    return this.attributes.resilience.value
  }

  set resilience(value: number) {
    this.attributes.resilience.setBaseValue(value)
  }

  @computed get baseResilience(): number {
    return this.attributes.resilience.baseValue
  }

  @computed get agility(): number {
    return this.attributes.agility.value
  }

  set agility(value: number) {
    this.attributes.agility.setBaseValue(value)
  }

  @computed get baseAgility(): number {
    return this.attributes.agility.baseValue
  }

  @computed get perception(): number {
    return this.attributes.perception.value
  }

  set perception(value: number) {
    this.attributes.perception.setBaseValue(value)
  }

  @computed get basePerception(): number {
    return this.attributes.perception.baseValue
  }

  @computed get maxHealth(): number {
    return this.stats.maxHealth.value
  }

  get healthPercentage(): number {
    return this.health / this.maxHealth
  }

  @computed get protection(): number {
    return this.stats.protection ? this.stats.protection.value : 0
  }

  @computed get criticalHitChance() {
    return this.stats.criticalHitChance ? this.stats.criticalHitChance.value : 0
  }

  @computed get evadeMeleeChance() {
    return this.stats.evadeMeleeChance ? this.stats.evadeMeleeChance.value : 0
  }

  @computed get evadeRangedChance() {
    return this.stats.evadeRangedChance ? this.stats.evadeRangedChance.value : 0
  }

  @computed get hitMeleeChance() {
    return this.stats.hitMeleeChance ? this.stats.hitMeleeChance.value : 0
  }

  @computed get hitRangedChance() {
    return this.stats.hitRangedChance ? this.stats.hitRangedChance.value : 0
  }

  @computed get statModifiers(): StatModifier[] {
    return this.calculateStatModifiers()
  }

  get passives(): Passive[] {
    return this.effects.list
  }

  get immunities(): Set<Effect['id']> {
    return this.passives.reduce((immunities, effect) => {
      effect.immunities.forEach(immunity => {
        immunities.add(immunity)
      })

      return immunities
    }, new Set<Effect['id']>())
  }

  calculateStatModifiers(): StatModifier[] {
    return this.calculatePassiveStatModifiers(this.passives)
  }

  calculatePassiveStatModifiers(passives: Passive[]): StatModifier[] {
    return passives.reduce(
      (modifiers: StatModifier[], passive: Passive) => modifiers.concat(passive.statModifiers),
      []
    )
  }

  calculateDamageInfliction(damage: number): number {
    const output = damage - this.protection
    const isProtected = damage < this.protection / 2

    return isProtected ? 0 : Math.max(Math.ceil(output), 1)
  }

  abstract get stats(): Stats

  attributes: Attributes = {
    strength: new IntegerAttribute('strength', this),
    charisma: new IntegerAttribute('charisma', this),
    resilience: new IntegerAttribute('resilience', this),
    agility: new IntegerAttribute('agility', this),
    perception: new IntegerAttribute('perception', this)
  }

  /**
   * Increase / decrease stat
   *
   * @param {string} stat - The stat to change
   * @param {number} change - The increase/decrease
   * @param {boolean} [notify] - Whether or not to display a notification
   * @param {number} [notificationTime] - The time to display the notification
   */
  @action changeAttribute = (
    attribute: TAttribute,
    change: number,
    notify = true,
    notificationTime: number | undefined = undefined
  ) => {
    if (typeof change === 'string') {
      change = parseInt(change)
    }

    const newValue = Math.max(this.attributes[attribute].baseValue + change, 1)

    this.attributes[attribute].setBaseValue(newValue)

    if (notify) {
      this.sendChangeNotification(
        t(`CHARACTER-ATTRIBUTE-${attribute.toUpperCase()}`),
        change,
        notificationTime
      )
    }
  }

  /**
   * Change health (heal/damage)
   *
   * @param {number} amount - The amount of HP to gain/lose
   * @param {boolean} notify - Whether or not to display a notification
   * @param {number} resultLimit - Limit the result of the change to this value
   */
  @action changeHealth = (amount: number, notify = false, resultLimit = 0) => {
    const { health, maxHealth } = this

    if (!this.alive) {
      return
    }

    const limit =
      amount > 0 && (resultLimit >= maxHealth || resultLimit === 0) ? maxHealth : resultLimit
    const value = Actor.calcLimitedChangeValue(amount, health, limit)

    this.health += value

    if (notify) {
      this.sendChangeNotification(t('CHARACTER-DERIVATIVE-HEALTH_POINTS-SHORT'), value, undefined)
    }
  }

  @action sendChangeNotification = (
    label: string,
    change: number,
    notificationTime: number | undefined
  ) => {
    let changePrefix = ''

    if (change > 0) {
      changePrefix = '+'
    }

    if (change === 0) {
      changePrefix = '±'
    }

    const message = this.name
      ? `${this.name} ${label} ${changePrefix}${change}`
      : `${label} ${changePrefix}${change}`

    this.game.notifications.create(message, notificationTime)
  }

  /**
   * Helper: Calculates Limited Change value
   *
   * It takes a positive or negative change amount and a current value and limit.
   * The result is an adjusted changeAmount that takes the limit into account.
   */
  static calcLimitedChangeValue(changeAmount: number, currentValue: number, limit: number) {
    if (changeAmount > 0) {
      if (currentValue > limit) {
        return 0
      } else if (currentValue + changeAmount > limit) {
        return limit - currentValue
      }
    } else if (changeAmount < 0) {
      if (currentValue < limit) {
        return 0
      } else if (currentValue + changeAmount < limit) {
        return currentValue - limit === 0 ? 0 : -(currentValue - limit)
      }
    }

    return changeAmount
  }
}

export { Actor }
export default Actor
