import type { EditorNpcTemplate, EditorArenaChallenge } from '@actnone/eldrum-editor/dist/types'
import type { TActionParticipant } from '../combat/combat'
import type SaveDataArenaChallenge from '../database/schemas/save/save-data/save-data-arena-challenge'
import type Game from '../game'
import { Actors } from '../actors'
import { observable } from 'mobx'
import { uuid } from '../../helpers/misc'

export type TArenaParticipant = {
  npc: EditorNpcTemplate
} & Omit<TActionParticipant, 'npc'>

export interface ArenaChallenge extends Omit<EditorArenaChallenge, 'opponents'> {
  opponents: TArenaParticipant[]
}

export class ArenaChallenge implements ArenaChallenge {
  constructor(
    public game: Game,
    private readonly tier: number,
    defaultProps: EditorArenaChallenge,
    storedProps?: SaveDataArenaChallenge
  ) {
    this._id = defaultProps._id

    this.opponents = defaultProps.opponents.map(opponent => {
      let editorNpcTemplate = this.game.getEntity('npcTemplates', opponent.npcTemplate)

      const level = opponent.levelScaleOffset
        ? ArenaChallenge.levelAfterOffset(
            ArenaChallenge.tierToLevel(tier),
            opponent.levelScaleOffset
          )
        : ArenaChallenge.tierToLevel(tier)

      editorNpcTemplate = Actors.scaleNpcTemplate(editorNpcTemplate, level)

      return {
        ...opponent,
        npc: {
          ...editorNpcTemplate,
          experience: 0,
          _id: opponent._id,
          template: opponent.npcTemplate
        },
        healthLimit: null
      }
    })

    this.defeated = typeof storedProps?.defeated === 'boolean' ? storedProps?.defeated : undefined
  }

  uuid = uuid()
  @observable defeated?: boolean

  get gold() {
    return ArenaChallenge.goldForTier(this.tier)
  }

  get experience() {
    return ArenaChallenge.experienceForTier(this.tier)
  }

  static tierToLevel = (tier: number) => tier + 5
  static levelAfterOffset = (level: number, offset: number) => Math.round(level * offset)

  static experienceForTier = (tier: number): number => {
    if (tier < 6) {
      return 10
    } else if (tier < 11) {
      return 15
    }

    return 20
  }

  static goldForTier = (tier: number): number => {
    if (tier < 6) {
      return 10
    } else if (tier < 11) {
      return 15
    }

    return 20
  }
}
