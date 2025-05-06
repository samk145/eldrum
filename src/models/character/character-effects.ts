import { reaction } from 'mobx'
import { ActorEffects, type IActorEffectsGenerics } from './actor-effects'
import type Character from './character'
import type Game from '../game'

export interface ICharacterEffectsGenerics extends IActorEffectsGenerics {
  Game: Game
  Actor: Character
}

export class CharacterEffects<
  G extends ICharacterEffectsGenerics = ICharacterEffectsGenerics
> extends ActorEffects<G> {
  constructor(
    private readonly game: G['Game'],
    protected readonly actor: G['Actor'],
    factory: ActorEffects['factory']
  ) {
    super(actor)

    this.factory = factory
  }

  factory: ActorEffects['factory']

  unmount = () => {
    this.onSceneChange()
    this.onNodeChange()
    this.onOptionUse()
    this.onLocationChange()
  }

  onSceneChange = reaction(
    () => this.game.scene.scene,
    () => {
      for (let i = this.list.length - 1; i >= 0; i--) {
        this.list[i]?.postSceneChange()
      }
    },
    { name: 'characterEffectsOnSceneChange' }
  )

  onNodeChange = reaction(
    () => this.game.scene.node,
    () => {
      for (let i = this.list.length - 1; i >= 0; i--) {
        this.list[i]?.postNodeChange()
      }
    },
    { name: 'characterEffectsOnNodeChange' }
  )

  onOptionUse = reaction(
    () => this.game.statistics.usedOptions.entries.length,
    () => {
      for (let i = this.list.length - 1; i >= 0; i--) {
        this.list[i]?.postOptionUse()
      }
    },
    { name: 'characterEffectsOnOptionUse' }
  )

  onLocationChange = reaction(
    () => this.game.movement.locationId,
    () => {
      for (let i = this.list.length - 1; i >= 0; i--) {
        this.list[i]?.postLocationChange()
      }
    },
    { name: 'characterEffectsOnLocationChange' }
  )
}
