import type { StatNames } from './stats'

export type StatModifier = {
  statName: StatNames
  value: number
  type: 'term' | 'factor' | 'set'
}
