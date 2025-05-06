import type SaveDataEffect from '../database/schemas/save/save-data/save-data-effect'
import type Actor from './actor'
import { observable, action } from 'mobx'
import type { Effect } from './effect'

export interface IActorEffectsGenerics {
  Actor: Actor
  Effect: Effect
}

export abstract class ActorEffects<G extends IActorEffectsGenerics = IActorEffectsGenerics> {
  constructor(protected readonly actor: G['Actor']) {}

  abstract factory(props: {
    effectId: G['Effect']['id']
    possessor: G['Actor']
    dissolver: (uuid: string) => void
    storedProps?: SaveDataEffect
  }): G['Effect']

  @observable list: G['Effect'][] = []

  @action addEffect(id: G['Effect']['id']) {
    const { removeEffectByUuid } = this

    if (this.actor.immunities.has(id)) {
      return false
    }

    const currentEffect = this.getEffectById(id)
    const newEffect = this.factory({
      effectId: id,
      possessor: this.actor,
      dissolver: removeEffectByUuid
    })

    if (newEffect.isStance) {
      this.removeStanceEffects()
    }

    if (currentEffect?.extendable) {
      currentEffect.uses += newEffect.uses
      currentEffect.onExtension?.()
    } else if (
      !currentEffect ||
      (currentEffect.stackable &&
        (!currentEffect.maximumStacks ||
          currentEffect.maximumStacks > this.getEffectsById(id).length))
    ) {
      this.list.push(newEffect)
      newEffect.onApplication?.()
    } else if (currentEffect?.replenishable) {
      currentEffect.uses = newEffect.uses
      currentEffect.onReplenish?.()
    }

    return true
  }

  @action removeEffectByUuid = (uuid: string) => {
    const effectIndex = this.list.findIndex(e => e.uuid === uuid)

    this.list.splice(effectIndex, 1)
  }

  @action removeEffectById(id: G['Effect']['id']) {
    const effectIndex = this.list.findIndex(e => e.id === id)

    if (effectIndex === -1) {
      return
    }

    this.list.splice(effectIndex, 1)
  }

  @action removeEffectsById(id: G['Effect']['id']) {
    this.list = this.list.filter(effect => effect.id !== id)
  }

  @action removeEffectsByFilter(filter: (effect: G['Effect']) => boolean) {
    this.list = this.list.filter(effect => !filter(effect))
  }

  @action removeStanceEffects = () => {
    this.removeEffectsByFilter(effect => effect.isStance)
  }

  @action restoreEffects = (storedEffects: SaveDataEffect[] = []) => {
    this.list = storedEffects.map(storedEffect => {
      const effect = this.factory({
        effectId: storedEffect.id,
        possessor: this.actor,
        dissolver: this.removeEffectByUuid,
        storedProps: storedEffect
      })

      return effect
    })
  }

  hasEffect(id: G['Effect']['id']) {
    return !!this.list.find(e => e.id === id)
  }

  getEffectById(id: G['Effect']['id']) {
    return this.list.find(e => e.id === id)
  }

  getEffectsById(id: G['Effect']['id']) {
    return this.list.filter(e => e.id === id)
  }

  getEffectByUuid = (uuid: string) => {
    return this.list.find(e => e.uuid === uuid)
  }
}
