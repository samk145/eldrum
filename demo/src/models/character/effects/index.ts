import type { SaveDataEffect } from '@actnone/eldrum-engine/models'
import type { TDemoActor } from '../t-actor'

import Aggressive from './aggressive'
import Bleeding from './bleeding'
import Defensive from './defensive'
import Disoriented from './disoriented'
import Exposed from './exposed'
import Hamstrung from './hamstrung'
import Immobilized from './immobilized'
import Incapacitated from './incapacitated'
import OverEncumbered from './over-encumbered'
import Parry from './parry'
import Shocked from './shocked'
import Staggered from './staggered'
import Stanched from './stanched'
import Sundered from './sundered'

const effectIds = [
  Aggressive.id,
  Bleeding.id,
  Defensive.id,
  Disoriented.id,
  Exposed.id,
  Hamstrung.id,
  Immobilized.id,
  Incapacitated.id,
  OverEncumbered.id,
  Parry.id,
  Shocked.id,
  Staggered.id,
  Stanched.id,
  Sundered.id
] as const

export type TDemoEffectId = (typeof effectIds)[number]

export type TDemoEffect =
  | Aggressive
  | Bleeding
  | Defensive
  | Disoriented
  | Exposed
  | Hamstrung
  | Immobilized
  | Incapacitated
  | OverEncumbered
  | Parry
  | Shocked
  | Staggered
  | Stanched
  | Sundered

const factory = ({
  effectId,
  possessor,
  dissolver,
  storedProps
}: {
  effectId: TDemoEffectId
  possessor: TDemoActor
  dissolver: (uuid: string) => void
  storedProps?: SaveDataEffect
}) => {
  const params = [possessor, dissolver, storedProps] as const

  switch (effectId.toLowerCase()) {
    case 'aggressive':
      return new Aggressive(...params)
    case 'bleeding':
      return new Bleeding(...params)
    case 'defensive':
      return new Defensive(...params)
    case 'disoriented':
      return new Disoriented(...params)
    case 'exposed':
      return new Exposed(...params)
    case 'hamstrung':
      return new Hamstrung(...params)
    case 'immobilized':
      return new Immobilized(...params)
    case 'incapacitated':
      return new Incapacitated(...params)
    case 'overencumbered':
      return new OverEncumbered(...params)
    case 'parry':
      return new Parry(...params)
    case 'shocked':
      return new Shocked(...params)
    case 'staggered':
      return new Staggered(...params)
    case 'stanched':
      return new Stanched(...params)
    case 'sundered':
      return new Sundered(...params)
    default:
      throw new Error(`Attempted to add an effect with a faulty name: ${effectId}.`)
  }
}

export { factory, effectIds }
