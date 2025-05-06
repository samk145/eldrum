import type { Effect } from '../../character/effect'
import type { TCombatParticipant } from '../combat-participant'
import type {
  CombatParticleModifier,
  CombatParticleModifierProperty,
  CombatParticleModifierType
} from './combat-particle-modifier'

import { AccessibilityInfo } from 'react-native'
import {
  sequentialPromiseResolver,
  randomNumberFromInterval,
  delay,
  clampBetween
} from '../../../helpers/misc'
import { BlockEvent, DamageEvent, EvadeEvent, MissEvent, ProtectedEvent } from '../combat-events'
import { CombatParticleResult } from './combat-particle-result'
import {
  effectInputConditions,
  type TEffectInputCondition
} from './compat-particle-effect-input-conditions'

export type TParticleInput = {
  readonly damage: Damage
  readonly distance: number
  readonly chanceToHit: number
  readonly chanceToCriticalHit: number
  readonly chanceToBlock: number
  readonly chanceToEvade: number
  readonly criticalHitDamageFactor: number
  readonly protection: number
}

/**
 * Particle TEffect Input
 *
 * The condition, if used, will determine whether or not the effect will
 * be applied to the target. If omitted, or only a string is supplied,
 * the effect will always be applied as part of the particle.
 */
export type TParticleEffectInput =
  | Effect['id']
  | {
      name: Effect['id']
      condition: ((result: CombatParticleResult) => boolean) | TEffectInputCondition[]
    }

export type TCombatParticleOptions = {
  timeToImpact: number
}

export class CombatParticle {
  constructor(
    public source: string,
    public sender: TCombatParticipant,
    public receiver: TCombatParticipant,
    damage: Damage = { min: 0, max: 0 },
    private readonly options: TCombatParticleOptions = { timeToImpact: -1 }
  ) {
    const distance = CombatParticle.distanceToTarget(sender.row, receiver.row)
    const baseHitChance =
      distance === 1 ? sender.actor.hitMeleeChance : sender.actor.hitRangedChance
    const baseEvadeChance =
      distance === 1 ? receiver.actor.evadeMeleeChance : receiver.actor.evadeRangedChance

    this.input = {
      damage: { ...damage }, // Copy values to remove any references
      distance,
      chanceToHit: distance === 1 ? sender.actor.hitMeleeChance : sender.actor.hitRangedChance,
      chanceToCriticalHit: sender.actor.criticalHitChance,
      chanceToBlock: receiver.actor.blockChance,
      chanceToEvade: CombatParticle.chanceToEvade(baseHitChance, baseEvadeChance),
      criticalHitDamageFactor: sender.isPlayer ? 1.5 : 1.2,
      protection: receiver.protection
    }

    this.result = new CombatParticleResult(receiver, this.input.distance)

    if (options.timeToImpact === -1) {
      options.timeToImpact = (distance - 1) * CombatParticle.defaultParticleSpeed
    }
  }

  input: TParticleInput
  modifiers: CombatParticleModifier[] = []
  effects: TParticleEffectInput[] = []
  result: CombatParticleResult

  /**
   * Add Modifier
   *
   * @param {string} property - The key of the property
   * @param {string} type - Can be one of: 'term', 'factor'
   * @param {number} value
   */
  addModifier = (
    property: CombatParticleModifierProperty,
    type: CombatParticleModifierType,
    value: number
  ) => {
    if (Object.prototype.hasOwnProperty.call(this.input, property)) {
      this.modifiers.push({ property, type, value })
    }
  }

  addEffect = (effectInput: TParticleEffectInput) => {
    this.effects.push(effectInput)
  }

  public get isProjectile() {
    return this.input.distance > 1
  }

  private get output() {
    const { input, modifiers } = this

    return CombatParticle.calculateOutput(input, modifiers)
  }

  private readonly attemptToHit = async (chanceToHit: number) => {
    const miss = Math.random() > chanceToHit

    if (miss) {
      this.result.miss = true
      await this.receiver.addEvent(new MissEvent())
      throw Error()
    }
  }

  private readonly attemptToBlock = async (chanceToBlock: number) => {
    const { receiver } = this
    const blocked = chanceToBlock > Math.random()

    if (blocked) {
      this.result.wasBlocked = true
      receiver.addAdvantagePoints(CombatParticle.bonusAdvantageFromBlock(receiver.actor.resilience))
      await receiver.addEvent(new BlockEvent(), 75)
      throw Error()
    }
  }

  private readonly attemptToEvade = async (chanceToEvade: number) => {
    const { receiver } = this
    const evaded = chanceToEvade > Math.random()

    if (evaded) {
      this.result.wasEvaded = true
      receiver.addAdvantagePoints(CombatParticle.bonusAdvantageFromEvade())
      await receiver.addEvent(new EvadeEvent(), 75)
      throw Error()
    }
  }

  private readonly attemptToDamage = async (output: TParticleInput) => {
    const { result, receiver } = this
    const { damage, chanceToCriticalHit, criticalHitDamageFactor } = output
    const { damageOutput: calculatedDamage, isCritical } = CombatParticle.calculateDamage(
      damage,
      chanceToCriticalHit,
      criticalHitDamageFactor
    )
    const damageToInflict = receiver.actor.calculateDamageInfliction(calculatedDamage)

    if (calculatedDamage > 0 && damageToInflict === 0) {
      await receiver.addEvent(new ProtectedEvent())
      result.wasProtected = true
    } else {
      receiver.takeDamage(damageToInflict)
      await receiver.addEvent(new DamageEvent(damageToInflict, isCritical, this.source))
      result.wasProtected = false
      result.wasCritical = isCritical
      result.inflictedDamage = damageToInflict
    }
  }

  private readonly attemptToApplyEffects = async () => {
    const { effects, receiver, result } = this

    if (!receiver.isAlive || receiver.hasReachedHealthLimit) {
      return
    }

    for (let i = 0; i < effects.length; i++) {
      const effectInput = effects[i]

      try {
        const effectId = typeof effectInput === 'string' ? effectInput : effectInput.name
        let passesConditions = true

        if (typeof effectInput === 'object' && 'condition' in effectInput) {
          if (typeof effectInput.condition === 'function') {
            passesConditions = effectInput.condition(result)
          } else {
            passesConditions = effectInput.condition.every(effectInputCondition => {
              const conditionResultFn = effectInputConditions[effectInputCondition.type]
              const conditionResult = conditionResultFn(effectInputCondition.parameters, result)

              return effectInputCondition.negate ? !conditionResult : conditionResult
            })
          }
        }

        if (passesConditions) {
          await receiver.attemptToApplyEffect(effectId)
          result.appliedEffects.push(effectId)
        }
      } catch (error) {}
    }
  }

  fire = async () => {
    const { sender, receiver, input, result, options } = this

    let screenReaderEnabled = false

    try {
      screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled()
    } catch (err) {}

    if (options.timeToImpact && !screenReaderEnabled) {
      await delay(options.timeToImpact)
    }

    try {
      await sequentialPromiseResolver(
        sender.actor.passives.map(passive => () => passive.preCastCombatParticle(this))
      )

      await sequentialPromiseResolver(
        receiver.actor.passives.map(
          passive => () => passive.preReceiveCombatParticle(sender, receiver, this)
        )
      )
    } catch (preventedByEffects) {
      result.wasPreventedByEffect = true
      await this.resolveEffectPostEvents()
      return result
    }

    // Important to get the output here, after effect hooks have been called,
    // since the value would otherwise be created before calling them.
    const output = this.output

    let failed = false

    try {
      await this.attemptToHit(output.chanceToHit)
      await this.attemptToBlock(output.chanceToBlock)
      await this.attemptToEvade(output.chanceToEvade)
    } catch (error) {
      failed = true
    }

    if (!failed) {
      if (input.damage.min > 0 && input.damage.max > 0) {
        await this.attemptToDamage(output)
      }
    }

    await this.attemptToApplyEffects()
    await this.resolveEffectPostEvents()

    return result
  }

  resolveEffectPostEvents = async () => {
    const { receiver, sender } = this

    await sequentialPromiseResolver(
      sender.actor.passives.map(passive => () => passive.postCastCombatParticle(this))
    )

    await sequentialPromiseResolver(
      receiver.actor.passives.map(
        passive => () => passive.postReceiveCombatParticle(sender, receiver, this)
      )
    )
  }

  /**
   * Returns the distance between two combat participants given their respective rows.
   * The value can range from 1 to N since opponents can never be on the same row.
   */
  static distanceToTarget = (senderRow: number, receiverRow: number) => {
    return Math.abs(receiverRow - senderRow)
  }

  static bonusAdvantageFromBlock(receiverResilience: number = 1) {
    return 150 + 75 * receiverResilience
  }

  static bonusAdvantageFromEvade() {
    return 150
  }

  static chanceToEvade = (senderChanceToHit: number, receiverEvadeChance: number) =>
    clampBetween(receiverEvadeChance - senderChanceToHit, 0, 0.95)

  static defaultParticleSpeed = 50

  static calculateOutput = (input: TParticleInput, modifiers: CombatParticleModifier[]) => {
    const output = { ...input, damage: { ...input.damage } }

    modifiers
      .sort((a, b) => {
        return a.type === 'set' ? 0 : -1
      })
      .forEach((m: CombatParticleModifier) => {
        if (m.type === 'term') {
          if (m.property === 'damage') {
            output.damage.min += m.value
            output.damage.max += m.value
          } else {
            output[m.property] += m.value
          }
        } else if (m.type === 'factor') {
          if (m.property === 'damage') {
            output.damage.min += input.damage.min * m.value - input.damage.min
            output.damage.max += input.damage.max * m.value - input.damage.max
          } else {
            output[m.property] += input[m.property] * m.value - input[m.property]
          }
        } else if (m.type === 'set') {
          if (m.property === 'damage') {
            output.damage.min = m.value
            output.damage.max = m.value
          } else {
            output[m.property] = m.value
          }
        }
      })

    return output
  }

  /**
   * Calculate Damage
   *
   * Calculates the damage output along with performing a calculation to see
   * if the damage is considered a critical hit, which in turn increases the damage.
   *
   * A hit is considered critical when the damage is in the top range of the damage,
   * based on the particle's critical hit chance.
   *
   * If there's no damage range (such as when min and max damage is the same), a
   * simplified crit chance calculation is performed.
   *
   * The point of this calculation is to make sure that there will never be critical
   * hits in the lower range of a damage output, because they will not "feel" like
   * critical hits if their damage is actually lower than the attacks's maximum
   * damage output which can otherwise happen.
   *
   * Example: With 1-10 damage and a critical hit chance of 20%, the hit will be
   * considered critical is it's in the top 20% of the attack's potential damage,
   * in this case 7.5 or higher ((10-1)/1.2=7.5).
   *
   */
  static calculateDamage = (
    damageRange: Damage,
    criticalHitChance: number,
    criticalHitDamageFactor: number
  ) => {
    const damageResult = randomNumberFromInterval(damageRange.min, damageRange.max)
    const difference = damageRange.max - damageRange.min
    const criticalDamageThreshold = difference - difference * criticalHitChance + damageRange.min
    const isCritical =
      difference > 0 ? damageResult >= criticalDamageThreshold : criticalHitChance > Math.random()
    const damageOutput = Math.floor(
      isCritical ? damageResult * criticalHitDamageFactor : damageResult
    )

    return { damageOutput, isCritical }
  }
}
