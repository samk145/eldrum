import type { TCombatParticipant } from '../combat/combat-participant'
import type Actor from './actor'
import type SaveDataEffect from '../database/schemas/save/save-data/save-data-effect'
import type { StatModifier } from './stat-modifier'

import { observable, action, when } from 'mobx'
import { Passive } from './passive'

const DEFAULT_USES = 99999

export interface IEffectGenerics {
  CombatParticipant: TCombatParticipant
  Effect: Effect
  Possessor: Actor
}

export abstract class Effect<G extends IEffectGenerics = IEffectGenerics> extends Passive<G> {
  constructor(
    public possessor: G['Possessor'],
    dissolver: (uuid: string) => void,
    storedProps?: SaveDataEffect
  ) {
    super(possessor)

    if (storedProps) {
      Object.assign(this, storedProps)
    }

    when(
      () => this.uses <= 0,
      () => {
        dissolver(this.uuid)
      }
    )
  }

  visible: boolean = true
  readonly extendable: boolean = false
  readonly stackable: boolean = false
  readonly maximumStacks?: number
  readonly replenishable?: boolean
  readonly preventsMovementInCombat: boolean = false
  readonly isStance: boolean = false
  readonly statModifiers: StatModifier[] = []

  onApplication?: () => void // Hook for when the effect is applied
  onReplenish?: () => void // Hook for when the effect is replenished
  onExtension?: () => void // Hook for when the effect is extended

  @observable uses: number = DEFAULT_USES

  @action use = (n = 1) => {
    this.uses -= n
  }

  @action remove = () => {
    this.uses = 0
  }
}

export default Effect
