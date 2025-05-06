import React, { useEffect } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Text, Icon } from '../../units'
import { type QuestObjective as QuestObjectiveModel } from '../../../models/quests'
import { useToken } from '../../../hooks'
import style from './quest-objective.style'

type TObjectiveProps = { data: QuestObjectiveModel }

const QuestObjective = ({ data }: TObjectiveProps) => {
  const token = useToken()
  const { t } = useTranslation()

  useEffect(() => {
    const objective = data

    objective.updateNotification(null)
  })

  const updatesList = () => {
    const { description, updates } = data

    const descriptions = updates
      .filter(u => u.active)
      .sort((a, b) => (b.activatedAt || 0) - (a.activatedAt || 0))
      .map(update => (
        <Text style={style.objectiveDescription} key={update._id}>
          {token.replace(update.description)}
        </Text>
      ))

    if (description) {
      descriptions.push(
        <Text style={style.objectiveDescription} key="0">
          {description}
        </Text>
      )
    }

    return descriptions
  }

  const { title, completed, notification } = data

  return (
    <View style={[style.objectiveWrapper, completed && style.objectiveWrapperCompleted]}>
      <View
        accessible
        accessibilityLabel={`${t('QUEST-LOG-OBJECTIVE_STATUS-COMPLETED-LABEL', { questName: title })}${completed ? ` (${t('QUEST-LOG-TAG_COMPLETED-LABEL')})` : ''}`}
        style={style.objectiveTitleWrapper}
      >
        <Icon
          name={completed ? 'checkboxChecked' : 'checkbox'}
          height={22}
          width={22}
          fill={style.objectiveTitle.color}
        />
        <Text style={style.objectiveTitle}>{title}</Text>
        {notification && (
          <Text style={style.notification}>
            {t(`QUEST-LOG-TAG_${notification.toUpperCase()}-LABEL`)}
          </Text>
        )}
      </View>
      <View>{updatesList()}</View>
    </View>
  )
}

export default QuestObjective
