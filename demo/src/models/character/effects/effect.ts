import type { TDemoCombatParticipant } from '~demo/models/combat/combat-participant'
import type { TDemoActor } from '../t-actor'
import type { TDemoEffect } from '.'
import { Effect, type IEffectGenerics } from '@actnone/eldrum-engine/models'

interface IDemoEffectGenerics extends IEffectGenerics {
  CombatParticipant: TDemoCombatParticipant
  Effect: TDemoEffect
  Possessor: TDemoActor
}

export abstract class DemoEffect extends Effect<IDemoEffectGenerics> {}
