import type { EditorSettings } from '@actnone/eldrum-editor/dist/types'
import type { DemoGame } from '~demo/models/game'
import { SaveData, type ISaveDataGenerics } from '@actnone/eldrum-engine/models'
import { DemoSaveDataCharacter } from './save-data-character'

interface IDemoSaveDataGenerics extends ISaveDataGenerics {
  Game: DemoGame
  SaveDataCharacter: DemoSaveDataCharacter
}

export class DemoSaveData extends SaveData<IDemoSaveDataGenerics> {
  characterFactory(
    character?: IDemoSaveDataGenerics['Game']['character'],
    defaultData?: EditorSettings['defaultData']['character']
  ) {
    return new DemoSaveDataCharacter(character, defaultData)
  }
}
