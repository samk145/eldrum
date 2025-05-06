import React from 'react'
import { Environment } from '../../../../config'
import { View, ScrollView, type GestureResponderEvent } from 'react-native'
import { useTranslation } from 'react-i18next'
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import { LinearGradient } from 'expo-linear-gradient'
import { useStores, useConfig } from '../../../../contexts/stores'
import { variables, helpers } from '../../../../styles'
import { AccessibilityFocus, Button, Card, Text } from '../../../units'
import { useDimensions } from '../../../../hooks/dimensions'
import Achievement from './achievement'
import style from './achievements.style'

const { colors } = variables

type TAchievementsProps = {
  backAction: (e: GestureResponderEvent) => void
}

const Achievements = ({ backAction }: TAchievementsProps) => {
  const { t } = useTranslation()
  const { achievements } = useStores()
  const { insets } = useDimensions()
  const config = useConfig()
  const completionPercentage = achievements.taskProgress * 100
  const humanFriendlyCompletionPercentage = achievements.toPercentageString(
    achievements.taskProgress
  )
  const progressLabel = (() => {
    const progress = completionPercentage / 100

    if (progress === 1) {
      return t('ACHIEVEMENTS-PROGRESS_COMPLETED-LABEL')
    }

    const levels = [1, 2, 3, 4, 5]
    const labelNumber = levels[Math.floor(progress * levels.length)]

    return t(`ACHIEVEMENTS-PROGRESS-LABEL-${labelNumber}`)
  })()

  return (
    <View style={[style.wrapper, { marginTop: insets.top, marginBottom: insets.bottom }]}>
      <Card corners="all" style={{ overflow: 'hidden' }}>
        <View style={style.cardWrapper}>
          <View style={style.progressWrapper}>
            <AnimatedCircularProgress
              width={variables.distance / 3}
              size={variables.distance * 6}
              fill={completionPercentage}
              rotation={0}
              tintColor={colors.teal}
              backgroundColor={helpers.hexToRgbA(colors.matte, 0.6)}
              duration={0}
            >
              {() => (
                <AccessibilityFocus id="MainMenuAchievementsHeader" accessibilityRole="header">
                  <Text
                    style={style.progressPercentage}
                    accessibilityLabel={`${t('ACHIEVEMENTS-PROGRESS-A11Y_LABEL')}: ${humanFriendlyCompletionPercentage} (${progressLabel})`}
                  >
                    {humanFriendlyCompletionPercentage}
                  </Text>
                </AccessibilityFocus>
              )}
            </AnimatedCircularProgress>
            <Text accessible={false} style={style.progressLabel}>
              {progressLabel}
            </Text>
          </View>
          <View style={style.achievementsWrapper}>
            <LinearGradient
              pointerEvents="none"
              colors={[`${colors.night}ff`, `${colors.night}00`]}
              style={style.gradient}
            />
            <ScrollView>
              {achievements.achievements
                .slice()
                .sort((a, b) => new Date(a._created).valueOf() - new Date(b._created).valueOf())
                .map((achievement, i) => (
                  <View
                    key={achievement._id}
                    style={[
                      style.achievementWrapper,
                      i === achievements.achievements.length - 1 && style.achievementsWrapperLast
                    ]}
                  >
                    <Achievement
                      achievement={achievement}
                      debug={config.environment === Environment.DEVELOPMENT || __DEV__}
                    />
                  </View>
                ))}
            </ScrollView>
            <LinearGradient
              pointerEvents="none"
              colors={[`${colors.night}00`, `${colors.night}ff`]}
              style={[style.gradient, style.bottomGradient]}
            />
          </View>
        </View>
      </Card>

      <View style={style.backButtonWrapper}>
        <Button label="Back" onPress={backAction} />
      </View>
    </View>
  )
}

export default Achievements
