import type { IntegerAttribute } from './integer-attribute'

export const attributes = ['strength', 'charisma', 'resilience', 'agility', 'perception'] as const

export interface Attributes {
  strength: IntegerAttribute
  charisma: IntegerAttribute
  resilience: IntegerAttribute
  agility: IntegerAttribute
  perception: IntegerAttribute
}

export type TAttribute = (typeof attributes)[number]

export interface AttributeValues {
  strength: number
  charisma: number
  resilience: number
  agility: number
  perception: number
}
