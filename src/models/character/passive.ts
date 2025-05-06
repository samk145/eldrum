import type { TCombatParticipant } from '../combat/combat-participant'
import type Actor from './actor'
import type { CombatParticle } from '../combat/combat-particle'
import type { StatModifier } from './stat-modifier'
import type { Effect } from './effect'
import { uuid } from '../../helpers/misc'

export interface IPassiveGenerics {
  CombatParticipant: TCombatParticipant
  Effect: Effect
  Possessor: Actor
}

export abstract class Passive<G extends IPassiveGenerics = IPassiveGenerics> {
  constructor(public possessor: G['Possessor']) {}
  abstract id: string
  abstract readonly statModifiers: StatModifier[]
  abstract visible: boolean
  readonly immunities: G['Effect']['id'][] = []
  uuid: string = uuid()

  /**
   * Hook: Post scene
   *
   * A hook which is triggered immediately after a scene change has occurred.
   *
   */
  postSceneChange = () => {}

  /**
   * Hook: Post node
   *
   * A hook which is triggered immediately after a node change has occurred in a scene.
   *
   */
  postNodeChange = () => {}

  /**
   * Hook: Post option use
   *
   * A hook which is triggered immediately after an option has been used in a scene.
   *
   */
  postOptionUse = () => {}

  /**
   * Hook: Post location change
   *
   * A hook which is triggered immediately after the player has entered a new location.
   *
   */
  postLocationChange = () => {}

  /**
   * Hook: Pre Combat
   *
   * A hook which is triggered immediately before combat begins.
   *
   */
  preCombat(participant: G['CombatParticipant']) {}

  /**
   * Hook: Post Combat
   *
   * A hook which is triggered immediately after combat has ended. This can be used to
   * remove effects such as Parry.
   *
   */
  postCombat(participant: G['CombatParticipant']) {}

  /**
   * Hook: Pre-cast particle
   *
   * A hook which is triggered before a participant has cast a particle. This can be useful for
   * effects meant to increase damage etc. of the caster's combat action.
   *
   * Resolving will continue the chain of events
   * Rejecting will prevent the particle from reaching the receiver
   *
   * @param   {object}  particle
   * @return  {Promise}
   */
  async preCastCombatParticle(particle: CombatParticle): Promise<void> {}

  /**
   * Hook: Post cast particle
   *
   * A hook which is triggered after a participant has cast a particle. This can be useful for
   * when an effect should be applied on the sender after a successful particle has been cast.
   *
   * @param   {object}  particle
   * @return  {Promise}
   */
  async postCastCombatParticle(particle: CombatParticle): Promise<void> {}

  /**
   * Hook: Pre-receive particle
   *
   * A hook which is triggered before a participant receives a particle. This can be
   * useful for effects which are meant to alter incoming particles, or simply discard them.
   *
   * Example: An effect which can prevent 1 incoming melee attack could check particle.distance and
   * particle.input.damage and reject the particle based on the results, along with removing itself.
   *
   * Resolving will continue the chain of events
   * Rejecting will prevent the particle from reaching the receiver
   *
   * @param   {object}  sender - The combat participant who cast the particle
   * @param   {object}  receiver - The combat participant who receives the particle
   * @param   {object}  particle
   * @return  {Promise}
   */
  async preReceiveCombatParticle(
    sender: G['CombatParticipant'],
    receiver: G['CombatParticipant'],
    particle: CombatParticle
  ): Promise<void> {}

  /**
   * Hook: Post receive particle
   *
   * A hook which is triggered after a participant has received a particle. It is only triggered
   * if the particle was successful, i.e. not evaded, blocked etc. This can be useful for effects
   * which should add another effect after impact.
   *
   * @param   {object}  sender - The combat participant who cast the particle
   * @param   {object}  receiver - The combat participant who receives the particle
   * @param   {object}  particle
   * @return  {Promise}
   */
  async postReceiveCombatParticle(
    sender: G['CombatParticipant'],
    receiver: G['CombatParticipant'],
    particle: CombatParticle
  ): Promise<void> {}

  /**
   * Hook: Pre Action
   *
   * A hook which is triggered immediately before a combat participant performs an action.
   * This can be useful for effects such as a poison that is meant to hurt its possessor
   * for each action they perform.
   *
   * Rejecting the promise has no effect, it's meant to resolve.
   *
   * @return  {Promise}
   */
  async preAction(participant: G['CombatParticipant']): Promise<void> {}

  /**
   * Hook: Post Action
   *
   * A hook which is triggered immediately after a combat participant has performed an action.
   *
   * Rejecting the promise has no effect, it's meant to resolve.
   *
   * @return  {Promise}
   */
  async postAction(participant: G['CombatParticipant']): Promise<void> {}

  /**
   * Hook: Pre turn
   *
   * A hook which is triggered immediately before a combat participant´s turn. This can be useful for
   * effects such as bleed.
   *
   * Rejecting the promise will prevent the participant from performing any actions.
   *
   * @return  {Promise}
   */
  async preCombatTurn(participant: G['CombatParticipant']): Promise<void> {}

  /**
   * Hook: Post turn
   *
   * A hook which is triggered immediately after a combat participant´s turn.
   *
   * Rejecting the promise has no effect, it's meant to resolve.
   *
   * @return  {Promise}
   */
  async postCombatTurn(participant: G['CombatParticipant']): Promise<void> {}
}
