import type { EditorNpc } from '@actnone/eldrum-editor/dist/types'
import type { DemoGame } from '../game'
import type { TCombatActionId } from '~demo/models/combat/combat-actions'
import type { TCombatBehaviorId } from '~demo/models/combat/combat-behavior'

import {
  Npc,
  type INpcGenerics,
  NpcEffects,
  type INpcEffectsGeneric,
  type SaveDataNpc
} from '@actnone/eldrum-engine/models'
import { DemoNpcAttack } from './attacks'
import { NpcAttacks } from '@actnone/eldrum-engine/models'
import { type TDemoEffect, factory as effectFactory } from '~demo/models/character/effects'
import { DemoNpcProtection, DemoNpcMaxHealth, DemoNpcSpeed } from './derivatives'

interface IDemoNpcEffectsGenerics extends INpcEffectsGeneric {
  Actor: DemoNpc
  Effect: TDemoEffect
}

interface DemoNpcGenerics extends INpcGenerics {
  Behavior: TCombatBehaviorId
  Game: DemoGame
}

export class DemoNpc extends Npc<DemoNpcGenerics> {
  constructor(
    game: DemoGame,
    defaultProps: EditorNpc & { combatActions: TCombatActionId[] },
    storedProps?: SaveDataNpc
  ) {
    super(game, defaultProps)

    this.effects = new NpcEffects(this, effectFactory, defaultProps.baseImmunities)

    if (defaultProps.attackSets) {
      this.attacks.attackSets = defaultProps.attackSets.map(attackSet =>
        attackSet.map(
          attack =>
            new DemoNpcAttack(attack, {
              melee: this.attacks.calculateMeleeDamage,
              ranged: this.attacks.calculateRangedDamage
            })
        )
      )
    }

    this.combatActions = defaultProps.combatActions || []
    this.stats.protection = new DemoNpcProtection(this)
    this.stats.maxHealth = new DemoNpcMaxHealth(this)
    this.stats.speed = new DemoNpcSpeed(this)
    this.postConstructor(storedProps)
  }

  effects: NpcEffects<IDemoNpcEffectsGenerics>
  combatActions: TCombatActionId[]
  attacks: NpcAttacks<DemoNpcAttack> = new NpcAttacks<DemoNpcAttack>(this)
}
