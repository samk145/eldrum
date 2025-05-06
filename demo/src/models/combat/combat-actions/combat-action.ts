import type { TDemoCombatParticipant } from '../combat-participant'
import type { TDemoCombatAttack } from '../combat-attack'
import type { TDemoEffect } from '~demo/models/character/effects'
import {
  CombatAction,
  AttackCombatAction,
  DefensiveCombatAction,
  OffensiveCombatAction,
  type ICombatActionGenerics,
  type IAttackCombatActionActionGenerics
} from '@actnone/eldrum-engine/models'

interface IDemoCombatActionGenerics extends ICombatActionGenerics {
  Participant: TDemoCombatParticipant
  Effect: TDemoEffect
}

type TCombatActionTag = 'utility' | 'attack' | 'offensive' | 'defensive'

export abstract class DemoCombatAction extends CombatAction<IDemoCombatActionGenerics> {
  abstract tags: Set<TCombatActionTag>
}

export abstract class DemoOffensiveCombatAction extends OffensiveCombatAction<IDemoCombatActionGenerics> {
  tags: Set<TCombatActionTag> = new Set<TCombatActionTag>(['offensive'] as const)
}

interface IDemoAttackCombatActionGenerics extends IAttackCombatActionActionGenerics {
  Participant: TDemoCombatParticipant
  Effect: TDemoEffect
  CombatAttack: TDemoCombatAttack
}

export abstract class DemoAttackCombatAction extends AttackCombatAction<IDemoAttackCombatActionGenerics> {
  tags: Set<Omit<TCombatActionTag, 'defensive'>> = new Set<Omit<TCombatActionTag, 'defensive'>>([
    'offensive',
    'attack'
  ] as const)
}

export abstract class DemoDefensiveCombatAction extends DefensiveCombatAction<IDemoCombatActionGenerics> {
  tags: Set<Omit<TCombatActionTag, 'offensive'>> = new Set<Omit<TCombatActionTag, 'offensive'>>([
    'defensive'
  ] as const)
}
