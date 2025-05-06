import Achievements from './achievements'
import Order from './order'
import Review from './review'
import { Save } from './save'
import {
  SaveData,
  SaveDataCharacter,
  SaveDataEffect,
  SaveDataInspector,
  SaveDataItem,
  SaveDataItemSlots,
  SaveDataMovement,
  SaveDataNpc,
  SaveDataQuest,
  SaveDataQuestLog,
  SaveDataQuestObjective,
  SaveDataQuestObjectiveUpdate,
  SaveDataScene,
  SaveDataSceneHistory,
  SaveDataStatistics,
  SaveDataTest,
  SaveDataTestTask,
  SaveDataTestTaskStep,
  SaveDataVariable,
  SaveDataVariables
} from './save/save-data'
import Settings from './settings'

export * from './save/save-data'
export * from './save'

export { Achievements, Order, Review, Save, Settings }

export const schemas = [
  Achievements.schema,
  Order.schema,
  Review.schema,
  Save.schema,
  SaveData.schema,
  SaveDataCharacter.schema,
  SaveDataEffect.schema,
  SaveDataInspector.schema,
  SaveDataItem.schema,
  SaveDataItemSlots.schema,
  SaveDataMovement.schema,
  SaveDataNpc.schema,
  SaveDataQuest.schema,
  SaveDataQuestLog.schema,
  SaveDataQuestObjective.schema,
  SaveDataQuestObjectiveUpdate.schema,
  SaveDataScene.schema,
  SaveDataSceneHistory.schema,
  SaveDataStatistics.schema,
  SaveDataTest.schema,
  SaveDataTestTask.schema,
  SaveDataTestTaskStep.schema,
  SaveDataVariable.schema,
  SaveDataVariables.schema,
  Settings.schema
]
