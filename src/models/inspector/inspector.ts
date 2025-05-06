import type Game from '../game'
import { observable, action } from 'mobx'
import Bot from './bot'
import ContentTest from './content-test/content-test'
import type SaveDataInspector from '../database/schemas/save/save-data/save-data-inspector'

export class Inspector {
  constructor(
    private readonly game: Game,
    storedProps?: SaveDataInspector
  ) {
    this.bot = new Bot(game)
    this.test = storedProps?.test
      ? new ContentTest(game, game.getEntity('tests', storedProps.test._id), storedProps.test)
      : null
  }

  bot: Bot
  @observable test: ContentTest | null

  @action selectTest = (id?: string) => {
    this.test = id ? new ContentTest(this.game, this.game.getEntity('tests', id)) : null
  }
}

export default Inspector
