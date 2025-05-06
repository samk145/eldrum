import type { TDemoEffect } from './effects'
import type { DemoCharacter } from './character'
import type { DemoGame } from '../game'
import { CharacterEffects, type ICharacterEffectsGenerics } from '@actnone/eldrum-engine/models'

interface IDemoCharacterEffectsGenerics extends ICharacterEffectsGenerics {
  Actor: DemoCharacter
  Effect: TDemoEffect
  Game: DemoGame
}

export class DemoCharacterEffects extends CharacterEffects<IDemoCharacterEffectsGenerics> {}
