import type { TDemoEffectId } from '~demo/models/character/effects'
import React from 'react'
import { View } from 'react-native'
// @ts-expect-error: Missing type definitions for 'react-native-markdown-view'
import { MarkdownView } from 'react-native-markdown-view'
import { useTranslation } from 'react-i18next'
import { style, descriptionMarkdownStyles, flavorMarkdownStyles } from './combat-info-box.style'
import { ActionPoint, Text } from '@actnone/eldrum-engine/components'
import { Icon } from '../icon/icon'

interface ICombatInfoBoxProps {
  title: string
  description?: string
  flavorText?: string
  cost?: {
    actionPoints: number
    advantage?: number
  }
  icon?: string
  effects?: string[]
}

const CombatInfoBox = ({
  title,
  description,
  flavorText,
  cost,
  icon,
  effects
}: ICombatInfoBoxProps) => {
  const { t } = useTranslation()

  return (
    <View style={style.wrapper}>
      <Text style={style.title}>{title}</Text>
      {cost && (
        <View style={style.costsWrapper}>
          {cost.actionPoints && cost.actionPoints > 0 && (
            <View style={style.costWrapper}>
              <ActionPoint filled diameter={7} />
              <Text style={style.costValue}>
                {cost.actionPoints > 1
                  ? t('COMBAT-ACTION-COST-ACTION_POINTS-VALUE_MULTIPLE-LABEL', {
                      value: cost.actionPoints
                    })
                  : t('COMBAT-ACTION-COST-ACTION_POINTS-VALUE_SINGLE-LABEL')}
              </Text>
            </View>
          )}
          {cost.advantage !== undefined && cost.advantage > 0 && (
            <View style={style.costWrapper}>
              <View style={style.costIcon}></View>
              <Text style={style.costValue}>
                {t('COMBAT-ACTION-COST-ADVANTAGE_POINTS-VALUE_MULTIPLE-LABEL', {
                  value: cost.advantage
                })}
              </Text>
            </View>
          )}
        </View>
      )}
      {description ? (
        <MarkdownView style={style.description} styles={descriptionMarkdownStyles}>
          {description}
        </MarkdownView>
      ) : null}
      {effects && effects.length > 0 && (
        <View style={style.effects}>
          <Text style={style.effectsLabel}>{t('EFFECTS-LABEL')}</Text>
          {effects.map(effect => {
            const effectIdAsUppercase = effect.toUpperCase() as Uppercase<TDemoEffectId>

            return (
              <View style={style.effect} key={effect}>
                <Text style={style.effectId}>{t(`EFFECT-${effectIdAsUppercase}-NAME`)}</Text>
                <MarkdownView style={style.description} styles={descriptionMarkdownStyles}>
                  {t(`EFFECT-${effectIdAsUppercase}-DESC`)}
                </MarkdownView>
              </View>
            )
          })}
        </View>
      )}
      {flavorText ? (
        <MarkdownView style={style.flavorText} styles={flavorMarkdownStyles}>
          {`"${flavorText}"`}
        </MarkdownView>
      ) : null}
      {icon && (
        <View style={style.iconWrapper}>
          <Icon name={icon} width={100} height={100} fill="#FFFFFF" />
        </View>
      )}
    </View>
  )
}

export { CombatInfoBox }
