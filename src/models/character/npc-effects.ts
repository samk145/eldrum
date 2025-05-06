import type Npc from './npc'
import { ActorEffects, type IActorEffectsGenerics } from './actor-effects'

export interface INpcEffectsGeneric extends IActorEffectsGenerics {
  Actor: Npc
}

export class NpcEffects<G extends INpcEffectsGeneric = INpcEffectsGeneric> extends ActorEffects<G> {
  constructor(
    protected readonly actor: G['Actor'],
    factory: ActorEffects['factory'],
    public readonly baseImmunities: INpcEffectsGeneric['Effect']['id'][] = []
  ) {
    super(actor)

    this.factory = factory
  }

  factory: ActorEffects['factory']
}
