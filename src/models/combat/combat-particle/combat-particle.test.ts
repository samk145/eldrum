import { CombatParticle, type TParticleInput } from './combat-particle'
import { CombatParticleModifier } from './combat-particle-modifier'

describe('CombatParticle damage calculation', () => {
  it('should return double damage when crit chance is guaranteed and crit damage is 200%', () => {
    const damage = 20
    const criticalHitDamageFactor = 2
    const { damageOutput, isCritical } = CombatParticle.calculateDamage(
      { min: damage, max: damage },
      1,
      2
    )

    expect(damageOutput).toBe(damage * criticalHitDamageFactor)
    expect(isCritical).toBe(true)
  })

  it('should return triple damage when crit chance is guaranteed and crit damage is 300%', () => {
    const damage = 5
    const criticalHitDamageFactor = 3
    const { damageOutput, isCritical } = CombatParticle.calculateDamage(
      { min: damage, max: damage },
      1,
      criticalHitDamageFactor
    )

    expect(damageOutput).toBe(damage * criticalHitDamageFactor)
    expect(isCritical).toBe(true)
  })
})

describe('CombatParticle output calculation', () => {
  it('Should always base factor calculations on the input', () => {
    const input: TParticleInput = {
      distance: 1,
      damage: {
        min: 5,
        max: 10
      },
      chanceToBlock: 0,
      chanceToEvade: 0,
      chanceToHit: 0,
      chanceToCriticalHit: 0,
      criticalHitDamageFactor: 0,
      protection: 20
    }

    const modifiers = [
      new CombatParticleModifier('damage', 'factor', 1.5),
      new CombatParticleModifier('damage', 'factor', 1.5),
      new CombatParticleModifier('protection', 'term', 1),
      new CombatParticleModifier('protection', 'factor', 0.5)
    ]

    const output = CombatParticle.calculateOutput(input, modifiers)

    expect(output.damage.min).toBe(10)
    expect(output.protection).toBe(11)
  })

  it('Should should always output the last set value', () => {
    const input: TParticleInput = {
      distance: 1,
      damage: {
        min: 5,
        max: 10
      },
      chanceToBlock: 0,
      chanceToEvade: 0,
      chanceToHit: 0,
      chanceToCriticalHit: 0,
      criticalHitDamageFactor: 0,
      protection: 5
    }

    const modifiers = [
      new CombatParticleModifier('protection', 'set', 1),
      new CombatParticleModifier('protection', 'set', 2),
      new CombatParticleModifier('protection', 'term', 1),
      new CombatParticleModifier('protection', 'set', 3),
      new CombatParticleModifier('protection', 'factor', 0.5)
    ]

    const output = CombatParticle.calculateOutput(input, modifiers)

    expect(output.protection).toBe(3)
  })
})
