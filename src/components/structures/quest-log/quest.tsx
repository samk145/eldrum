import type {
  QuestObjective as QuestObjectiveModel,
  Quest as QuestModel
} from '../../../models/quests'
import React from 'react'
import { ScrollView, View } from 'react-native'
import { AccessibilityFocus, Text } from '../../units'
import QuestObjective from './quest-objective'
import style from './quest.style'

type TQuestProps = {
  data: QuestModel
}

function sortObjectives(objectives: QuestObjectiveModel[]) {
  const incompleteObjectives = objectives.filter(objective => !objective.completed)
  const completedObjectives = objectives.filter(objective => objective.completed).reverse()

  return incompleteObjectives.concat(completedObjectives)
}

const Quest = ({ data }: TQuestProps) => {
  const { name, description, visibleObjectives } = data
  const sortedObjectives = sortObjectives(visibleObjectives)

  return (
    <View>
      <Text style={style.questTitle}>{name}</Text>
      <ScrollView style={style.questScrollWrapper}>
        <AccessibilityFocus id="QuestDescription">
          <Text style={style.questDescription}>{description}</Text>
        </AccessibilityFocus>
        <View style={style.objectiveList}>
          {sortedObjectives.map(objective => (
            <QuestObjective key={objective._id} data={objective} />
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default Quest
