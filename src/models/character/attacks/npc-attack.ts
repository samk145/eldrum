import type { EditorNpcAttack } from '@actnone/eldrum-editor/dist/types'
import type { TParticleEffectInput } from '../../combat'

import { computed, action, observable } from 'mobx'
import Attack from './attack'

export type TNpcAttackSet = NpcAttack[]

export class NpcAttack<
  TEditorNpcAttack extends EditorNpcAttack = EditorNpcAttack
> extends Attack<TEditorNpcAttack> {
  @observable uses = 0

  particleEffects: TParticleEffectInput[] = []

  get usageTerm() {
    return this.attack.usageTerm || 'attack'
  }

  get ammunitionQuantity() {
    return this.attack.ammunitionQuantity || 0
  }

  get usesAmmunition() {
    return !!this.ammunitionQuantity
  }

  @computed get available() {
    const { ranged } = this

    if (ranged) {
      if (this.usesAmmunition && this.uses >= this.ammunitionQuantity) {
        return false
      }
    }

    return true
  }

  @action use = () => this.uses++
}

export default NpcAttack
