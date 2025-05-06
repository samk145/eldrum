import type { Database, Save } from '../models/database'
import type { Config } from '../config'
import type { Game } from '../models/game'
import { AchievementsStore } from './achievements'
import { ContentStore, type TContentProp, type TMediaFiles } from './content'
import { NotificationsStore } from './notifications'
import { PurchaseStore } from './purchase'
import { ReviewStore } from './review'
import { SavesStore, type TSaveFactory } from './saves'
import { SettingsStore } from './settings'
import { PlayStore, type TGameFactory } from './play'
import { SystemStore } from './system'
import { UiStore } from './ui'

export * from './achievements'
export * from './content'
export * from './notifications'
export * from './purchase'
export * from './review'
export * from './saves'
export * from './settings'
export * from './play'
export * from './system'
export * from './ui'

export interface IStoresGenerics {
  Game: Game
  Content: TContentProp
  Media: TMediaFiles
  PlayStore: PlayStore
  SavesStore: SavesStore
  Save: Save
  Database: Database
}

export class Stores<G extends IStoresGenerics = IStoresGenerics> {
  constructor({
    config,
    content,
    database,
    gameFactory,
    saveFactory,
    media
  }: {
    config: Config
    content: G['Content']
    database: G['Database']
    gameFactory: TGameFactory<G['Game']>
    saveFactory: TSaveFactory<G['Game'], G['Save']>
    media: G['Media']
  }) {
    this.content = new ContentStore(content, media, config)
    this.settings = new SettingsStore(this.content, database, config)
    this.ui = new UiStore(this.settings)
    this.purchase = new PurchaseStore(
      {
        ui: this.ui,
        settings: this.settings
      },
      database
    )

    this.saves = new SavesStore<{
      Game: G['Game']
      Save: G['Save']
      Database: G['Database']
    }>(
      {
        ui: this.ui,
        settings: this.settings
      },
      database,
      saveFactory
    )

    this.play = new PlayStore(gameFactory, this)

    this.notifications = new NotificationsStore(
      {
        content: this.content,
        play: this.play
      },
      config
    )

    this.review = new ReviewStore(
      {
        ui: this.ui,
        play: this.play,
        settings: this.settings
      },
      database
    )

    this.achievements = new AchievementsStore(
      {
        content: this.content,
        ui: this.ui,
        settings: this.settings,
        saves: this.saves,
        play: this.play
      },
      database
    )

    this.system = new SystemStore(this, database)
  }

  ui: UiStore
  content: ContentStore
  settings: SettingsStore
  purchase: PurchaseStore
  saves: G['SavesStore']
  play: G['PlayStore']
  notifications: NotificationsStore
  review: ReviewStore
  achievements: AchievementsStore
  system: SystemStore
}
