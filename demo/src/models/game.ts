import type { DemoSaveData } from './database/schemas/save/save-data'

import { Bargain, Actors } from '@actnone/eldrum-engine/models'
import { DemoBargainItem } from './item'
import { observable } from 'mobx'
import { Game, type TEngageInCombatParams, type IGameGenerics } from '@actnone/eldrum-engine/models'
import { DemoCombat, type TDemoActionParticipant } from './combat/combat'
import { DemoCharacter } from './character/character'
import { DemoNpc } from './character/npc'

interface IDemoGameGenerics extends IGameGenerics {
  Character: DemoCharacter
  Combat: DemoCombat
  SaveData: DemoSaveData
}

export class DemoGame extends Game<IDemoGameGenerics> {
  @observable character: DemoCharacter = new DemoCharacter(this)
  @observable bargain: Bargain<DemoBargainItem> | null = null
  @observable actors: Actors<DemoNpc> = new Actors<DemoNpc>(
    this,
    (defaultProps, storedProps) => new DemoNpc(this, defaultProps, storedProps)
  )

  combatFactory(
    params: TEngageInCombatParams<TDemoActionParticipant>,
    onEnd: (playerWon: boolean) => void
  ) {
    return new DemoCombat(this, onEnd, params.npcParticipants, params.options)
  }

  bargainFactory = (npcId: string, onEnd: () => void): Bargain<DemoBargainItem> => {
    return new Bargain<DemoBargainItem>(this, item => new DemoBargainItem(item), onEnd, npcId)
  }
}
