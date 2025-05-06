import type { Config } from '@actnone/eldrum-engine/config'
import { Stores } from '@actnone/eldrum-engine/stores'
import type { TContentProp, IStoresGenerics } from '@actnone/eldrum-engine/stores'
import { DemoGame } from '~demo/models/game'
import { database } from '~demo/services/database'
import * as editorContent from '../data/content'
import { image as imageFiles, audio as audioFiles } from '../data/media'
import { DemoSave } from '~demo/models/database/schemas/save'

interface DemoStoresGenerics extends IStoresGenerics {
  Game: DemoGame
}

const content: TContentProp = {
  achievements: editorContent.achievements.data,
  areas: editorContent.areas.data,
  items: editorContent.items.data,
  locations: editorContent.locations.data,
  lootTables: editorContent.lootTables.data,
  media: editorContent.media.data,
  npcs: editorContent.npcs.data,
  npcTemplates: editorContent.npcTemplates.data,
  paths: editorContent.paths.data,
  quests: editorContent.quests.data,
  scenes: editorContent.scenes.data,
  scriptures: editorContent.scriptures.data,
  settings: editorContent.settings.data,
  variables: editorContent.variables.data
} as unknown as TContentProp // This is needed because TS is set to parse JSON imports but is not able to infer these types

export class DemoStores extends Stores<DemoStoresGenerics> {
  constructor(config: Config) {
    super({
      config,
      content,
      database,
      gameFactory: constructorParams => new DemoGame(...constructorParams),
      saveFactory: props => new DemoSave(props),
      media: {
        image: imageFiles,
        audio: audioFiles
      }
    })
  }
}
