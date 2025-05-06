import type { EditorFaction } from '@actnone/eldrum-editor/dist/types'
import type Variable from './variables/variable'
import type Game from './game'
import { t } from '../i18n'
import { reaction, type IReactionDisposer } from 'mobx'

export interface Faction extends Pick<EditorFaction, '_id' | 'name'> {}

export class Faction {
  constructor(
    private readonly game: Game,
    public readonly variable: Variable,
    defaultProps: EditorFaction
  ) {
    this._id = defaultProps._id
    this.reputation = Number(this.variable.value)

    this.listener = reaction(
      () => this.variable.value as number,
      newReputation => {
        if (newReputation !== this.reputation) {
          const change = newReputation - this.reputation

          this.reputation = newReputation
          this.game.notifications.create(
            t(
              change > 0
                ? 'FACTION-REPUTATION-INCREASE-MESSAGE'
                : 'FACTION-REPUTATION-DECREASE-MESSAGE',
              { factionName: this.name }
            )
          )
        }
      },
      { name: `FactionListener-${this.name}` }
    )
  }

  reputation: number
  listener: IReactionDisposer

  get name() {
    return t(`FACTION-${this._id}-NAME`, { ns: 'factions' })
  }

  private set name(_: string) {}
}

export class Factions {
  constructor(game: Game) {
    const {
      _content: {
        settings: { factions }
      }
    } = game

    this.list = factions.map(faction => {
      const variable = game.variables.getVariable(faction.variable)

      return new Faction(game, variable, faction)
    })
  }

  list: Faction[] = []

  getByVariableId = (id: string) => {
    return this.list.find(faction => faction.variable._id === id)
  }

  unmount = () => {
    this.list.forEach(faction => faction.listener())
  }
}

export default Factions
