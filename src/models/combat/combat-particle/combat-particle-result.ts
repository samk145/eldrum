import type { Effect } from '../../character/effect'
import type { TCombatParticipant } from '../combat-participant'

export class CombatParticleResult {
  constructor(
    public target: TCombatParticipant,
    public distanceTravelled: number
  ) {}

  public inflictedDamage: number = 0
  public miss: boolean = false
  public wasBlocked: boolean = false
  public wasCritical: boolean = false
  public wasEvaded: boolean = false
  public wasPreventedByEffect: boolean = false
  public wasProtected?: boolean
  public appliedEffects: Effect['id'][] = []

  public get wasProjectile() {
    return this.distanceTravelled > 1
  }

  public get hit() {
    return !this.miss && !this.wasBlocked && !this.wasEvaded && !this.wasPreventedByEffect
  }
}
