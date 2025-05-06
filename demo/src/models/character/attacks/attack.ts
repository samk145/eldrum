import type { EditorNpcAttack, EditorItemAttack } from '@actnone/eldrum-editor/dist/types'
import type { TCombatActionId } from '~demo/models/combat/combat-actions'
import { CharacterAttack, NpcAttack, Attack } from '@actnone/eldrum-engine/models'

export type TDemoEditorItemAttack = EditorItemAttack & { combatActions: TCombatActionId[] }
export type TDemoEditorNpcAttack = EditorNpcAttack & { combatActions: TCombatActionId[] }
export type TDemoCharacterAttackSet = DemoCharacterAttack[]

export abstract class DemoAttack extends Attack {
  abstract combatActions: TCombatActionId[]
}

export class DemoCharacterAttack
  extends CharacterAttack<TDemoEditorItemAttack>
  implements DemoAttack
{
  get combatActions() {
    return this.attack.combatActions
  }
}

export class DemoNpcAttack extends NpcAttack<TDemoEditorNpcAttack> implements DemoAttack {
  get combatActions() {
    return this.attack.combatActions
  }
}

export type TDemoAttack = DemoCharacterAttack | DemoNpcAttack
export type TDemoAttackSet = TDemoAttack[]
export type TDemoAttackSets = TDemoAttackSet[]
