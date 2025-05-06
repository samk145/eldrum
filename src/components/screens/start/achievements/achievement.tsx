import type { Achievement as TAchievement } from '../../../../models/achievements'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, TouchableOpacity } from 'react-native'
import { variables } from '../../../../styles'
import { ProgressBar, Text, Highlighter } from '../../../units'
import { observer } from 'mobx-react'
import Checkbox from './checkbox'
import style from './achievement.style'

const { distance, colors } = variables

const ICON_RADIUS = distance * 1.5
const SMALL_ICON_RADIUS = ICON_RADIUS / 2

type TAchievementProps = {
  achievement: TAchievement
  debug?: boolean
}

const Achievement = ({ achievement, debug = false }: TAchievementProps) => {
  const { t } = useTranslation()
  const achievementHasMultipleTasks = achievement.tasks.length > 1
  const achievementLabel = achievement.isDiscovered ? achievement.name : '?'
  const accessibleAchievementLabel = `${
    achievement.isDiscovered ? achievement.name : t('ACHIEVEMENTS-UNKNOWN-LABEL')
  } (${achievement.isComplete ? t('ACHIEVEMENTS-COMPLETED-LABEL') : t('ACHIEVEMENTS-INCOMPLETE-LABEL')})`

  return (
    <Highlighter
      highlight={achievement.hasUpdate}
      position={'top-right'}
      type="label"
      label={t('ACHIEVEMENTS-COMPLETED-LABEL')}
      customOffset={{ right: 0 }}
    >
      <View style={style.wrapper}>
        {debug ? (
          <TouchableOpacity accessible={false} onPress={achievement.toggleCompletionStatus}>
            <Checkbox size={ICON_RADIUS} isComplete={achievement.isComplete} />
          </TouchableOpacity>
        ) : (
          <Checkbox size={ICON_RADIUS} isComplete={achievement.isComplete} />
        )}

        <View style={style.details}>
          {achievement.isDiscovered ? (
            <Text
              accessibilityRole="header"
              accessibilityLabel={accessibleAchievementLabel}
              style={style.name}
            >
              {achievementLabel}
            </Text>
          ) : (
            <Text
              accessibilityRole="header"
              accessibilityLabel={accessibleAchievementLabel}
              style={[style.name, style.undiscoveredAchievementName]}
            >
              {achievementLabel}
            </Text>
          )}
          {achievement.isDiscovered && (
            <View style={style.description}>
              <Text style={style.lightText}>{achievement.description}</Text>
            </View>
          )}

          {achievement.isDiscovered && achievement.descriptiveTasks && (
            <View style={style.tasks}>
              {achievement.tasks.map((task, index) => {
                const label = task.isDiscovered ? task.name : t('ACHIEVEMENTS-UNKNOWN-LABEL')

                return (
                  <View
                    key={task._id}
                    style={style.descriptiveTaskWrapper}
                    accessible
                    accessibilityLabel={`${t('ACHIEVEMENTS-TASK-LABEL')} ${index + 1}: ${label} (${
                      task.isComplete
                        ? t('ACHIEVEMENTS-COMPLETED-LABEL')
                        : t('ACHIEVEMENTS-INCOMPLETE-LABEL')
                    })`}
                  >
                    {debug ? (
                      <TouchableOpacity accessible={false} onPress={task.toggleCompletionStatus}>
                        <Checkbox size={SMALL_ICON_RADIUS} isComplete={task.isComplete} />
                      </TouchableOpacity>
                    ) : (
                      <Checkbox size={SMALL_ICON_RADIUS} isComplete={task.isComplete} />
                    )}
                    <View>
                      {task.isDiscovered ? (
                        <Text style={style.taskDescription}>{label}</Text>
                      ) : (
                        <Text style={[style.taskDescription, style.undiscoveredTaskDescription]}>
                          {label}
                        </Text>
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          )}
          {achievement.isDiscovered &&
            !achievement.descriptiveTasks &&
            achievementHasMultipleTasks && (
              <View style={{ marginTop: distance / 2 }}>
                <ProgressBar
                  maxValue={achievement.tasks.length}
                  value={
                    achievement.isComplete
                      ? achievement.tasks.length
                      : achievement.tasks.filter(task => task.isComplete).length
                  }
                  showValuesOnPress
                  color={colors.teal}
                ></ProgressBar>
              </View>
            )}
        </View>
      </View>
    </Highlighter>
  )
}

export default observer(Achievement)
