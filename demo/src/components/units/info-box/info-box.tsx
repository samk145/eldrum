import type { TFunction } from 'i18next'
import type { TDemoEffectId } from '~demo/models/character/effects'

import React from 'react'
import { View, StyleSheet, type ViewStyle } from 'react-native'
import { useTranslation } from 'react-i18next'
// @ts-expect-error: Missing type definitions for 'react-native-markdown-view'
import { MarkdownView } from 'react-native-markdown-view'
import removeMd from 'remove-markdown'
import { variables, helpers, styles } from '@actnone/eldrum-engine/styles'
import { Text } from '@actnone/eldrum-engine/components'
import { Icon } from '../icon/icon'
import { Cost } from './cost'

const { colors, distance, fonts } = variables

const ERROR_ICON_SIZE = distance / 1.5

export interface InfoBoxProps {
  title?: string
  description?: string
  flavorText?: string
  disclaimer?: string
  disclaimerError?: boolean
  cost?: {
    actionPoints: number
    advantage?: number
  }
  icon?: string
  effects?: Set<TDemoEffectId>
  modifiers?: string[]
  style?: ViewStyle
}

const getAccessibilityLabel = (
  {
    title,
    description,
    flavorText,
    cost,
    available
  }: Omit<InfoBoxProps, 'icon' | 'effects'> & { available: boolean },
  t: TFunction<'translation', undefined>
) => {
  let label: string = title || ''

  if (!available) {
    label += `(${t('UNAVAILABLE')})`
  }

  if (cost) {
    label += '\nCost: '

    if (cost.actionPoints) {
      label +=
        cost.actionPoints > 1
          ? t('COMBAT-ACTION-COST-ACTION_POINTS-VALUE_MULTIPLE-LABEL', { value: cost.actionPoints })
          : t('COMBAT-ACTION-COST-ACTION_POINTS-VALUE_SINGLE-LABEL')
    }

    if (cost.actionPoints && cost.advantage) {
      label += ','
    }

    if (cost.advantage) {
      label += t('COMBAT-ACTION-COST-ADVANTAGE_POINTS-VALUE_MULTIPLE-LABEL', {
        value: cost.advantage
      })
    }
  }

  if (description) {
    label += `\n${removeMd(description)}`
  }

  if (flavorText) {
    label += `\n${removeMd(flavorText)}`
  }

  return label
}

const InfoBox = ({
  title,
  disclaimer,
  disclaimerError,
  description,
  flavorText,
  cost,
  icon,
  effects,
  modifiers,
  ...rest
}: InfoBoxProps) => {
  const { t } = useTranslation()

  return (
    <View style={[style.wrapper, rest.style]}>
      {title && <Text style={style.title}>{title}</Text>}

      {cost && (
        <Cost
          style={style.costsWrapper}
          actionPoints={cost.actionPoints}
          advantage={cost.advantage}
        />
      )}

      {description ? (
        <MarkdownView style={style.description} styles={descriptionMarkdownStyles}>
          {description}
        </MarkdownView>
      ) : null}

      {modifiers && modifiers.length > 0 && (
        <View style={style.modifiers}>
          <Text style={style.modifiersLabel}>{t('ABILITIES-MODIFIERS-LABEL')}</Text>
          {modifiers.map((modifier, i) => (
            <MarkdownView key={i} style={style.modifier} styles={modifierDescriptionMarkdownStyles}>
              {modifier}
            </MarkdownView>
          ))}
        </View>
      )}

      {flavorText ? (
        <MarkdownView style={style.flavorText} styles={flavorMarkdownStyles}>
          {`"${flavorText}"`}
        </MarkdownView>
      ) : null}

      {effects && effects.size > 0 && (
        <View style={style.effects}>
          {[...effects].map(effect => {
            const effectIdAsUppercase = effect.toUpperCase() as Uppercase<TDemoEffectId>

            return (
              <View style={style.effect} key={effect}>
                <Text style={style.effectId}>{t(`EFFECT-${effectIdAsUppercase}-NAME`)}</Text>
                <MarkdownView style={style.description} styles={effectDescriptionMarkdownStyles}>
                  {t(`EFFECT-${effectIdAsUppercase}-DESC`)}
                </MarkdownView>
              </View>
            )
          })}
        </View>
      )}

      {icon && (
        <View style={style.iconWrapper}>
          <Icon name={icon} width={distance * 6} height={distance * 6} fill="#FFFFFF" />
        </View>
      )}

      {disclaimer && (
        <View style={style.disclaimerContainer}>
          {disclaimerError && (
            <Icon
              name="warning"
              style={style.disclaimerErrorIcon}
              fill={colors.garnet}
              height={ERROR_ICON_SIZE}
              width={ERROR_ICON_SIZE}
            />
          )}
          <Text style={style.disclaimer}>{disclaimer}</Text>
        </View>
      )}
    </View>
  )
}

InfoBox.getAccessibilityLabel = getAccessibilityLabel

const sectionPadding = {
  paddingTop: distance / 2,
  paddingBottom: distance / 2,
  paddingRight: distance,
  paddingLeft: distance
}

const style = StyleSheet.create({
  wrapper: {
    position: 'relative'
  },
  title: {
    ...sectionPadding,
    ...helpers.FontSizeAndLineHeight(fonts.body + 3),
    fontFamily: fonts.display,
    color: colors.white,
    textAlign: 'center',
    textTransform: 'capitalize'
  },
  disclaimerContainer: {
    marginVertical: distance / 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  disclaimerErrorIcon: {
    marginRight: distance / 4
  },
  disclaimer: {
    ...helpers.FontSizeAndLineHeight(fonts.body - 4),
    fontFamily: fonts.display,
    color: colors.white,
    textAlign: 'center'
  },
  description: {
    ...sectionPadding
  },
  costsWrapper: {
    ...sectionPadding,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  flavorText: {
    ...sectionPadding
  },
  iconWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.05
  },
  effects: {
    marginTop: distance / 2,
    marginBottom: distance / 2,
    borderWidth: 1,
    borderRadius: distance,
    borderColor: colors.nightLight,
    paddingTop: distance / 4
  },
  modifiers: {
    marginTop: distance / 2,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.nightLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: distance
  },
  modifier: {
    marginBottom: distance / 2
  },
  modifiersLabel: {
    ...helpers.FontSizeAndLineHeight(fonts.body - 6),
    fontFamily: fonts.display,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: colors.turmeric,
    marginTop: -(fonts.body - 6) / 1.7,
    marginBottom: distance / 4
  },
  effect: {
    ...sectionPadding,
    opacity: 0.5
  },
  effectId: {
    ...helpers.FontSizeAndLineHeight(fonts.body - 6),
    textTransform: 'uppercase',
    fontFamily: fonts.demi,
    textAlign: 'center',
    color: colors.white
  },
  effectDescription: {
    color: 'white'
  }
})

const descriptionMarkdownStyles = {
  ...styles.markdown,
  text: {
    ...helpers.FontSizeAndLineHeight(fonts.body - 4),
    textAlign: 'center'
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
    textAlign: 'center',
    fontFamily: variables.fonts.default,
    color: colors.white
  },
  strong: {
    fontFamily: variables.fonts.demi,
    fontWeight: '400',
    color: colors.turmeric
  },
  em: {
    fontFamily: variables.fonts.defaultItalic,
    fontWeight: '400',
    color: colors.white
  }
}

const modifierDescriptionMarkdownStyles = {
  ...descriptionMarkdownStyles,
  text: {
    ...helpers.FontSizeAndLineHeight(fonts.body - 7),
    color: colors.white,
    textAlign: 'center'
  }
}

const effectDescriptionMarkdownStyles = {
  ...descriptionMarkdownStyles,
  text: {
    ...helpers.FontSizeAndLineHeight(fonts.body - 6),
    color: colors.white,
    textAlign: 'center'
  }
}

const flavorMarkdownStyles = {
  ...styles.markdown,
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
    textAlign: 'center'
  },
  text: {
    ...helpers.FontSizeAndLineHeight(fonts.body - 8),
    fontFamily: fonts.regularItalic,
    color: colors.parchment,
    textAlign: 'center'
  }
}

export { InfoBox }
