import type { TDemoCombatParticipant } from '../combat-participant'
import type { TCombatActionType } from '@actnone/eldrum-engine/models'
import type { TDemoCombatAttack } from '../combat-attack'

import Bite from './bite'
import Cut from './cut'
import Glide from './glide'
import Hamstring from './hamstring'
import Hook from './hook'
import Parry from './parry'
import Pummel from './pummel'
import Puncture from './puncture'
import Sever from './sever'
import Slam from './slam'
import Stun from './stun'
import Sweep from './sweep'
import Thrust from './thrust'
import Trip from './trip'

const combatActionClasses = [
  Bite,
  Cut,
  Glide,
  Hamstring,
  Hook,
  Parry,
  Pummel,
  Puncture,
  Sever,
  Slam,
  Stun,
  Sweep,
  Thrust,
  Trip
]

const combatActionIds = combatActionClasses.map(Class => Class.id)

type TCombatActionId = (typeof combatActionIds)[number]

type TCombatAction =
  | Bite
  | Cut
  | Glide
  | Hamstring
  | Hook
  | Parry
  | Pummel
  | Puncture
  | Sever
  | Slam
  | Stun
  | Sweep
  | Thrust
  | Trip

const missingAttackError = `Missing attack parameter when creating combat action`

const factory = (
  actionId: TCombatActionId,
  possessor: TDemoCombatParticipant,
  combatAttack?: TDemoCombatAttack
): TCombatAction => {
  switch (actionId) {
    case 'bite':
      if (!combatAttack) {
        throw new Error(missingAttackError)
      }

      return new Bite(possessor, combatAttack)

    case 'cut':
      if (!combatAttack) {
        throw new Error(missingAttackError)
      }

      return new Cut(possessor, combatAttack)

    case 'glide':
      return new Glide(possessor)

    case 'hamstring':
      if (!combatAttack) {
        throw new Error(missingAttackError)
      }

      return new Hamstring(possessor, combatAttack)

    case 'hook':
      return new Hook(possessor)

    case 'pummel':
      if (!combatAttack) {
        throw new Error(missingAttackError)
      }

      return new Pummel(possessor, combatAttack)

    case 'puncture':
      if (!combatAttack) {
        throw new Error(missingAttackError)
      }

      return new Puncture(possessor, combatAttack)

    case 'sever':
      if (!combatAttack) {
        throw new Error(missingAttackError)
      }

      return new Sever(possessor, combatAttack)

    case 'slam':
      if (!combatAttack) {
        throw new Error(missingAttackError)
      }

      return new Slam(possessor, combatAttack)

    case 'stun':
      if (!combatAttack) {
        throw new Error(missingAttackError)
      }

      return new Stun(possessor, combatAttack)

    case 'sweep':
      return new Sweep(possessor)

    case 'thrust':
      if (!combatAttack) {
        throw new Error(missingAttackError)
      }

      return new Thrust(possessor, combatAttack)

    case 'trip':
      return new Trip(possessor)

    case 'parry':
      return new Parry(possessor)

    default:
      throw new Error(`Attempted to build a combat action with a faulty name.`)
  }
}

const getClass = (id: TCombatActionId) => {
  const result = combatActionClasses.find(Class => Class.id === id)

  if (!result) {
    throw new TypeError(`Couldn't find a combat action class with id ${id}`)
  }

  return result
}

export type { TCombatAction, TCombatActionType, TCombatActionId }
export { factory, getClass, combatActionIds }
