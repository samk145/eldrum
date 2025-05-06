import { type DemoGame } from '../game'
import {
  Combat,
  type ICombatGenerics,
  type TCombatOptions,
  type TActionParticipants,
  type TActionParticipant
} from '@actnone/eldrum-engine/models'
import { DemoPlayerCombatParticipant, DemoNpcCombatParticipant } from './combat-participant'
import type { DemoNpc } from '../character/npc'

interface IDemoCombatGenerics extends ICombatGenerics {
  Game: DemoGame
  Opponent: DemoNpcCombatParticipant
  Player: DemoPlayerCombatParticipant
}

export type TDemoActionParticipant = TActionParticipant<DemoNpc>

export class DemoCombat extends Combat<IDemoCombatGenerics> {
  constructor(
    game: IDemoCombatGenerics['Game'],
    onEnd: (playerWon: boolean) => void,
    actionParticipants: TActionParticipants<TDemoActionParticipant>,
    options: TCombatOptions = {}
  ) {
    super(game, onEnd, options)

    const [opponent, ...restOpponents] = actionParticipants.map(actionParticipant =>
      DemoCombat.npcFactory(game, this, actionParticipant)
    )

    this.participants = [
      new DemoPlayerCombatParticipant(options.playerHealthLimit || null, game.character, this),
      opponent,
      ...restOpponents
    ]

    this.postConstruct()
  }

  participants: [
    DemoPlayerCombatParticipant,
    DemoNpcCombatParticipant,
    ...DemoNpcCombatParticipant[]
  ]

  static npcFactory = (
    game: IDemoCombatGenerics['Game'],
    combat: DemoCombat,
    actionParticipant: TDemoActionParticipant
  ) => {
    return new DemoNpcCombatParticipant(
      actionParticipant.startingRow || 1,
      actionParticipant.healthLimit || null,
      actionParticipant.npc,
      combat
    )
  }
}
