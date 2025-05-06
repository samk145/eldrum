import type { TCombatParticipant, TCombatOptions } from '@actnone/eldrum-engine/models'
import React from 'react'
import { View } from 'react-native'
// @ts-expect-error: Missing type definitions for 'react-native-markdown-view'
import { MarkdownView } from 'react-native-markdown-view'
import {
  CardModal,
  Icon,
  Text,
  AccessibilityFocus,
  Button,
  EModalType
} from '@actnone/eldrum-engine/components'
import { variables } from '@actnone/eldrum-engine/styles'
import { useTranslation } from 'react-i18next'
import { observer } from 'mobx-react'
import { logger } from '@actnone/eldrum-engine/helpers'
import styles, { createMarkdownStyles, iconSize } from './pre-combat-information.style'

const EDITOR_PLAYER_INITIATIVE_VALUE = 'player'

type TPreCombatInformation = {
  icon: string
  title: string
  description: string
}

type TPreCombatInformationProps = {
  visible: boolean
  close: () => void
  combatOptions: TCombatOptions
  participants: TCombatParticipant[]
}

const markdownStyles = createMarkdownStyles(variables.colors.white)

const PreCombatInformation = ({
  visible,
  close,
  combatOptions,
  participants
}: TPreCombatInformationProps): JSX.Element => {
  const { t } = useTranslation()
  const preCombatInformation: TPreCombatInformation[] = []

  if (combatOptions.customTurnOrder) {
    preCombatInformation.push({
      icon: 'initiative',
      title: t('COMBAT-PRE_INFO-INITIATIVE-TITLE'),
      description: createCustomInitiativeDescription(combatOptions.customTurnOrder)
    })
  }

  if (combatOptions.isConfinedSpace) {
    preCombatInformation.push({
      icon: 'confinedSpace',
      title: t('COMBAT-PRE_INFO-CONFINED_SPACE-TITLE'),
      description: t('COMBAT-PRE_INFO-CONFINED_SPACE-MESSAGE')
    })
  }

  function resolveParticipantName(participantId: string) {
    if (participantId === EDITOR_PLAYER_INITIATIVE_VALUE)
      return t('COMBAT-PRE_INFO-INITIATIVE-MESSAGE-PLAYER_NAME')

    const npcParticipant = participants.find(participant => participant.id === participantId)

    if (!npcParticipant) {
      logger.warn(`The NPC with id "${participantId}" could not be found among combat participants`)

      return 'Opponent'
    }

    return npcParticipant.name
  }

  function createCustomInitiativeDescription(turnOrder: string[]) {
    const participantsNames = turnOrder.map(p => `**${resolveParticipantName(p)}**`)

    if (participantsNames.length === 1 && turnOrder[0] === EDITOR_PLAYER_INITIATIVE_VALUE) {
      return t('COMBAT-PRE_INFO-INITIATIVE-MESSAGE-PLAYER')
    } else if (participantsNames.length === 1) {
      return t('COMBAT-PRE_INFO-INITIATIVE-MESSAGE-SINGLE', { name: participantsNames[0] })
    } else {
      return t('COMBAT-PRE_INFO-INITIATIVE-MESSAGE-MULTIPLE', {
        commaSeparatedNames: participantsNames.slice(0, participantsNames.length - 1).join(', '),
        name: participantsNames.splice(participantsNames.length - 1, 1)
      })
    }
  }

  return (
    <CardModal
      mode={EModalType.JS}
      useOverlay
      overlayOpacity={0.3}
      visible={visible}
      useHandler={false}
      onOverlayPress={close}
    >
      <View style={styles.wrapper}>
        {preCombatInformation.map(({ icon, title, description }) => {
          return (
            <View style={styles.infoWrapper} key={title}>
              <View style={styles.iconWrapper}>
                <Icon
                  name={icon}
                  height={iconSize}
                  width={iconSize}
                  fill={variables.colors.matte}
                />
              </View>
              <AccessibilityFocus id="preCombatInformation" focusOnUpdate={false}>
                <Text style={styles.title}>{title}</Text>
                <MarkdownView style={styles.description} styles={markdownStyles}>
                  {description}
                </MarkdownView>
              </AccessibilityFocus>
              <Button
                style={styles.button}
                onPress={close}
                label={t('COMBAT-PRE_INFO-CONTINUE_BUTTON-LABEL')}
              />
            </View>
          )
        })}
      </View>
    </CardModal>
  )
}

export default observer(PreCombatInformation)
