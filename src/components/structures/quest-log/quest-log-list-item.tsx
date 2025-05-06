import type { Quest as QuestModel, QuestObjective } from '../../../models/quests'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { observer } from 'mobx-react'
import { variables, helpers } from '../../../styles'
import { AccessibilityFocus, Text } from '../../units'

const { colors, distance, fonts } = variables
const notificationDistance = helpers.getSizeValue(-(distance / 4), -(distance / 6))

const QuestLogListItem = ({
  onSelect,
  selected,
  quest,
  shouldFocus
}: {
  onSelect: (quest: QuestModel) => void
  selected: boolean
  quest: QuestModel
  shouldFocus: boolean
}) => {
  const { t } = useTranslation()
  const completedObjectivesCount = quest.visibleObjectives.filter(
    (o: QuestObjective) => o.completed
  ).length
  const totalObjectivesCount = quest.visibleObjectives.length

  return (
    <AccessibilityFocus
      id={`QuestLogListItem-${quest._id}`}
      accessibilityLabel={
        quest.completed
          ? `${quest.name} (${t('QUEST-LOG-TAG_COMPLETED-LABEL')})`
          : `${quest.name} ${t('QUEST-LOG-QUEST_OBJECTIVES-COMPLETED-A11Y_LABEL', {
              completedCount: completedObjectivesCount,
              totalCount: totalObjectivesCount
            })}`
      }
      focusOnUpdate={false}
      shouldFocus={shouldFocus}
    >
      <TouchableOpacity
        touchSoundDisabled={true}
        style={style.listItem}
        onPress={() => onSelect(quest)}
      >
        <View style={{ flexDirection: 'row' }}>
          <Text
            style={[
              style.listItemName,
              quest.completed && style.listItemCompleted,
              selected && style.listItemTextSelected,
              selected && quest.completed && style.listItemTextSelectedCompleted
            ]}
          >
            {quest.name}
          </Text>
          {quest.notification && (
            <Text style={style.notification}>
              {t(`QUEST-LOG-TAG_${quest.notification.toUpperCase()}-LABEL`)}
            </Text>
          )}
        </View>
        {!quest.completed && (
          <Text style={style.listItemStatus}>
            {completedObjectivesCount} / {totalObjectivesCount}
          </Text>
        )}
      </TouchableOpacity>
    </AccessibilityFocus>
  )
}

const style = StyleSheet.create({
  listItem: {
    paddingTop: distance / 3,
    paddingBottom: distance / 3,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  listItemName: {
    color: colors.faded,
    fontFamily: fonts.default,
    ...helpers.FontSizeAndLineHeight(fonts.body - 2)
  },
  listItemCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5
  },
  listItemTextSelected: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: colors.white,
    color: colors.white
  },
  listItemTextSelectedCompleted: {
    textDecorationLine: 'line-through',
    color: colors.white
  },
  notification: {
    marginTop: notificationDistance,
    marginLeft: notificationDistance,
    color: colors.azure,
    fontFamily: variables.fonts.demi,
    ...helpers.FontSizeAndLineHeight(fonts.body - 7),
    textTransform: 'uppercase'
  },
  listItemStatus: {
    color: colors.faded,
    fontFamily: fonts.default,
    ...helpers.FontSizeAndLineHeight(fonts.body - 2),
    opacity: 0.5
  }
})

export default observer(QuestLogListItem)
