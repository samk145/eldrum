import type { TParticleInput } from './combat-particle'

export type CombatParticleModifierProperty = Exclude<keyof TParticleInput, 'distance'>
export type CombatParticleModifierType = 'term' | 'factor' | 'set'

export class CombatParticleModifier {
  constructor(
    public property: CombatParticleModifierProperty,
    public type: CombatParticleModifierType,
    public value: number
  ) {}
}
