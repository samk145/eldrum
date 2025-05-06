import { action, computed } from 'mobx'
import type { TCombatAttack } from './combat-attack'
import type { TCombatParticipant } from './combat-participant'
import { CombatParticle } from './combat-particle'
import type {
  TParticleEffectInput,
  TCombatParticleOptions,
  CombatParticleModifier,
  CombatParticleResult
} from './combat-particle'
import { CombatActionEvent } from './combat-events'
import { getSiblingRangeFromList, uuid, sequentialPromiseResolver } from '../../helpers/misc'
import type Effect from '../character/effect'

export type TCombatActionType = 'offensive' | 'defensive'

export interface TCombatActionParticles {
  primaryParticles: CombatParticle[]
  splashParticles: CombatParticle[]
}

export interface TCombatActionResult {
  primaryResults: CombatParticleResult[]
  splashResults: CombatParticleResult[]
}

export interface ICombatActionGenerics {
  Participant: TCombatParticipant
  Effect: Effect
}

export abstract class CombatAction<G extends ICombatActionGenerics = ICombatActionGenerics> {
  constructor(public participant: G['Participant']) {}

  uuid: string = uuid()
  abstract id: string
  abstract cost: number
  abstract type: TCombatActionType
  abstract use: () => Promise<void>
  abstract fulfillsNonAdvantageRequirements: boolean

  @computed get fulfillsAdvantageRequirements() {
    if (this.cost === Infinity) {
      return this.participant.advantagePoints > 0
    }

    return this.participant.advantagePoints >= this.cost
  }

  @computed get usable() {
    return this.fulfillsAdvantageRequirements && this.fulfillsNonAdvantageRequirements
  }

  @action deduceCost = () => {
    const cost = this.cost === Infinity ? this.participant.maxAdvantagePoints : this.cost

    this.participant.removeAdvantagePoints(cost)
  }

  @action async preUse() {
    this.deduceCost()
    await this.participant.addEvent(new CombatActionEvent(this.id))
  }
}

export interface IDefensiveCombatActionGenerics extends ICombatActionGenerics {
  Effect: Effect
}

export abstract class DefensiveCombatAction<
  G extends IDefensiveCombatActionGenerics = IDefensiveCombatActionGenerics
> extends CombatAction<G> {
  static type = 'defensive' as const
  type = DefensiveCombatAction.type
  effects: G['Effect']['id'][] = []

  effectIsApplicable = (effectId: G['Effect']['id']) => {
    const effect = this.participant.actor.effects.getEffectById(effectId)

    return !!(
      !effect ||
      (effect && (effect.stackable || effect.extendable || effect.replenishable))
    )
  }

  @computed get fulfillsNonAdvantageRequirements() {
    return this.effects.every(this.effectIsApplicable)
  }

  @action use = async () => {
    const { participant } = this

    await this.preUse()

    this.effects.forEach(effect => {
      participant.actor.effects.addEffect(effect)
    })
  }
}

export interface IOffensiveCombatActionActionGenerics extends ICombatActionGenerics {}

type TCombatActionParticleDamage = Damage | (() => Damage)

export abstract class OffensiveCombatAction<
  G extends IOffensiveCombatActionActionGenerics = IOffensiveCombatActionActionGenerics
> extends CombatAction<G> {
  particleDamage: TCombatActionParticleDamage = { min: 0, max: 0 }
  particleEffects: TParticleEffectInput[] = []
  particleModifiers: CombatParticleModifier[] = []
  splashRange?: number = 0
  splashParticleDamage: TCombatActionParticleDamage = { min: 0, max: 0 }
  splashParticleEffects: TParticleEffectInput[] = []
  splashParticleModifiers: CombatParticleModifier[] = []
  static type = 'offensive' as const
  type = OffensiveCombatAction.type

  protected createParticle = (
    receiver: G['Participant'],
    effects: TParticleEffectInput[] = [],
    modifiers: CombatParticleModifier[] = [],
    damage?: TCombatActionParticleDamage,
    options?: TCombatParticleOptions
  ) => {
    const particle = new CombatParticle(
      this.id,
      this.participant,
      receiver,
      typeof damage === 'function' ? damage() : damage,
      options
    )

    modifiers.forEach(m => particle.addModifier(m.property, m.type, m.value))
    effects.forEach(e => particle.addEffect(e))

    return particle
  }

  createPrimaryTargetParticles = (
    receiver: G['Participant'],
    effects: TParticleEffectInput[] = [],
    modifiers: CombatParticleModifier[] = []
  ) => {
    const { createParticle, particleDamage } = this

    return [createParticle(receiver, effects, modifiers, particleDamage)]
  }

  protected getSplashTargets(target: G['Participant'], aliveOpponents: G['Participant'][]) {
    const { splashRange } = this
    const aliveOpponentsOnSameRow = aliveOpponents.filter(opponent => opponent.row === target.row)
    const targetIndex = aliveOpponentsOnSameRow.findIndex(opponent => opponent.id === target.id)

    const splashTargetsIds =
      targetIndex > -1 && aliveOpponentsOnSameRow.length > 1
        ? getSiblingRangeFromList(
            aliveOpponentsOnSameRow.map(p => p.id),
            targetIndex,
            splashRange
          )
        : []

    return aliveOpponentsOnSameRow.filter(participant => splashTargetsIds.includes(participant.id))
  }

  /**
   * Hook: Pre Particles Fire
   *
   * A hook which is triggered before all particles created by the combat action are fired.
   *
   * Resolving will continue the chain of events
   * Rejecting will not affect the chain of events
   *
   * @return  {Promise}
   */
  protected preParticlesFire = (particles: TCombatActionParticles) =>
    new Promise<void>(resolve => resolve())

  /**
   * Hook: Post Particles Fire
   *
   * A hook which is triggered before all particles created by the combat action are fired.
   *
   * This can be useful when a combat action wants conditional post particle behavior, such
   * as adding Advantage after a successful attack.
   *
   * Resolving will continue the chain of events
   * Rejecting will not affect the chain of events
   *
   * @param   {CombatParticleResult[]}  results
   * @return  {Promise}
   */
  protected async postParticlesFire(result: TCombatActionResult) {}

  private debugDamageOutput(result: TCombatActionResult) {
    const totalPrimaryDamage = result.primaryResults.reduce((total, result) => {
      return total + result.inflictedDamage
    }, 0)

    const totalSplashDamage = result.splashResults.reduce((total, result) => {
      return total + result.inflictedDamage
    }, 0)

    const totalDamage = totalPrimaryDamage + totalSplashDamage

    console.log('---------- Combat action result:', this.id, '----------')
    console.log('totalDamage', totalDamage)

    if (this.cost) {
      console.log('Cost:', this.cost)
      console.log('Damage per advantage point:', (totalDamage / this.cost).toFixed(3))
    }

    console.log(
      'totalPrimaryDamage:',
      totalPrimaryDamage,
      `from ${result.primaryResults.length} primary particles`
    )
    console.log(
      'totalSplashDamage',
      totalSplashDamage,
      `from ${result.splashResults.length} splash particles`
    )
    console.log('----------------------------------------')
  }

  /**
   * Use
   *
   * Triggers the action, sending combat particles towards the target (i.e. primary target)
   * as well as creating and sending combat particles towards splash targets, if available.
   *
   * The damage for each particle is based on the action's particleDamage and
   * splashParticleDamage properties.
   *
   * @return  {Promise}
   */
  @action use = async () => {
    const {
      participant,
      createParticle,
      particleEffects,
      particleModifiers,
      splashParticleDamage,
      splashParticleEffects,
      splashParticleModifiers,
      splashRange
    } = this
    const { target, aliveOpponents } = participant
    const splashTargets = this.getSplashTargets(target, aliveOpponents)

    await this.preUse()

    const primaryParticles: CombatParticle[] = []
    const splashParticles: CombatParticle[] = []

    if (splashRange) {
      splashTargets.forEach(splashTarget => {
        splashParticles.push(
          createParticle(
            splashTarget,
            splashParticleEffects,
            splashParticleModifiers,
            splashParticleDamage
          )
        )
      })
    }

    if (target) {
      primaryParticles.push(
        ...this.createPrimaryTargetParticles(target, particleEffects, particleModifiers)
      )
    }

    await this.preParticlesFire({
      primaryParticles,
      splashParticles
    })

    const particleResults: TCombatActionResult = {
      primaryResults: await sequentialPromiseResolver(primaryParticles.map(p => p.fire)),
      splashResults: await sequentialPromiseResolver(splashParticles.map(p => p.fire))
    }

    await this.postParticlesFire(particleResults)
  }
}

export interface IAttackCombatActionActionGenerics extends IOffensiveCombatActionActionGenerics {
  CombatAttack: TCombatAttack
}

export abstract class AttackCombatAction<
  G extends IAttackCombatActionActionGenerics = IAttackCombatActionActionGenerics
> extends OffensiveCombatAction<G> {
  constructor(
    participant: G['Participant'],
    public combatAttack: G['CombatAttack']
  ) {
    super(participant)

    this.particleDamage = this.combatAttack.attack.damage
    this.splashParticleDamage = this.combatAttack.attack.damage
  }

  @computed get fulfillsNonAdvantageRequirements() {
    return this.attackIsUsable
  }

  @computed get attackIsUsable() {
    return AttackCombatAction.passesUsabilityChecks(this.combatAttack)
  }

  static passesUsabilityChecks = (combatAttack: TCombatAttack) => combatAttack.usable

  static inflictedDamage = (result: CombatParticleResult) => {
    return result.inflictedDamage > 0
  }

  preParticlesFire = async (particles: TCombatActionParticles) => {
    await Promise.all([
      ...particles.primaryParticles.map(particle => this.combatAttack.preFire(particle)),
      ...particles.splashParticles.map(particle => this.combatAttack.preFire(particle))
    ])
  }
}
