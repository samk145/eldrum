import type { EditorItemAttack } from '@actnone/eldrum-editor/dist/types'
import type { DemoCharacterAttack } from './attack'
import { type Character, CharacterAttacks } from '@actnone/eldrum-engine/models'

export class DemoCharacterAttacks extends CharacterAttacks<EditorItemAttack, DemoCharacterAttack> {
  calculateMeleeBooster(actor: Character): number {
    const additionalStrength = actor.strength - 1 || 0

    return Math.round(additionalStrength / 2)
  }

  calculateRangedBooster = (perception: number): number => {
    return perception
  }
}
