import type { TResources } from '@actnone/eldrum-engine/stores'
import type { DemoGame } from '../../../game'

import { Save, type ISaveGenerics } from '@actnone/eldrum-engine/models'
import { DemoSaveData } from './save-data'

interface IDemoSaveGenerics extends ISaveGenerics {
  Game: DemoGame
  SaveData: DemoSaveData
}

export class DemoSave extends Save<IDemoSaveGenerics> {
  saveDataFactory(
    data?: IDemoSaveGenerics['Game'],
    content?: TResources
  ): IDemoSaveGenerics['SaveData'] {
    return new DemoSaveData(data, content)
  }
}
