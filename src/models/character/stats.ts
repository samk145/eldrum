import type { Attributes } from './attributes'
import type Stat from './stat'

export interface Stats {
  speed: Stat
  protection: Stat
  blockChance?: Stat
  evadeMeleeChance: Stat
  evadeRangedChance: Stat
  hitMeleeChance: Stat
  hitRangedChance: Stat
  criticalHitChance: Stat
  maxEncumbrance?: Stat
  maxHealth: Stat
  maxActionPoints: Stat
  initiative: Stat
}

export interface StatValues {
  speed: number
  protection: number
  blockChance?: number
  evadeMeleeChance: number
  evadeRangedChance: number
  hitMeleeChance: number
  hitRangedChance: number
  criticalHitChance: number
  maxEncumbrance?: number
  maxHealth: number
  maxActionPoints: number
  initiative: number
}

export type StatNames = keyof Attributes | keyof StatValues | 'meleeDamage' | 'rangedDamage'
