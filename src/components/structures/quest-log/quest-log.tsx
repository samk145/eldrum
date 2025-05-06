import type { Quest as QuestModel } from '../../../models/quests'
import React, { useState, useCallback } from 'react'
import { View, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import { observer } from 'mobx-react'
import { useGameStore } from '../../../contexts/stores'
import { Text } from '../../units'
import QuestLogItem from './quest-log-list-item'
import Quest from './quest'
import style from './quest-log.style'

export const QuestLog = observer(() => {
  const { t } = useTranslation()
  const { questLog } = useGameStore()
  const [selected, setSelected] = useState<string | null>(null)
  const { items } = questLog
  const selectedQuest = selected && items.find(q => q._id === selected)

  const selectQuest = useCallback((quest: QuestModel) => {
    setSelected(quest._id)
    quest.updateNotification(null)
  }, [])

  const renderList = (items: QuestModel[]) => {
    const list = items
      /**
       * We use a slice to make a copy of the observable
       * array, so we don't modify it in place
       *  */
      .slice()
      .sort((a, b) => {
        return a.completed && b.completed ? 0 : a.completed ? 1 : -1
      })
      .map((quest, index) => {
        return (
          <QuestLogItem
            onSelect={selectQuest}
            key={quest._id}
            quest={quest}
            selected={selected === quest._id}
            shouldFocus={index === 0}
          />
        )
      })

    return list.length ? (
      <ScrollView style={style.list}>
        {list}
        <View style={{ height: 40 }}></View>
      </ScrollView>
    ) : (
      <ScrollView style={style.list}>
        <Text style={style.empty}>{t('QUEST-LOG-LIST_EMPTY-LABEL')}</Text>
      </ScrollView>
    )
  }

  return (
    <React.Fragment>
      <View style={style.selection}>
        {selectedQuest && <Quest key={selected} data={selectedQuest} />}
      </View>
      {renderList(items)}
    </React.Fragment>
  )
})
