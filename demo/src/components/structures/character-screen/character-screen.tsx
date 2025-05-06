import {
  attributes,
  type TAttribute,
  type IntegerAttribute,
  type Slot
} from '@actnone/eldrum-engine/models'
import type { TCombatActionId } from '~demo/models/combat/combat-actions'

import React, { useMemo, useState } from 'react'
import { observer } from 'mobx-react'
import { View, ScrollView } from 'react-native'
import { A11y } from 'react-native-a11y-order'
import { useTranslation, Trans } from 'react-i18next'
import {
  AccessibilityFocus,
  Button,
  Fieldset,
  ProgressBar,
  Tooltip,
  RoundButton,
  Text,
  Icon
} from '@actnone/eldrum-engine/components'
import { useDemoGameStore } from '~demo/hooks'
import { GearSwapper } from '../gear-swapper/gear-swapper'
import { CombatActionTooltip } from '~demo/components/units'
import { variables } from '@actnone/eldrum-engine/styles'
import { truncate, camelCaseToConstCase } from '@actnone/eldrum-engine/helpers'
import Attacks from './attacks'
import style, { warningIconSize } from './character-screen.style'

const { colors } = variables

export const CharacterScreen = observer((): JSX.Element => {
  const { t } = useTranslation()
  const { character, _ui } = useDemoGameStore()
  const [showEquipmentModal, setShowEquipmentModal] = useState(false)
  const [slotBeingEdited, setSlotBeingEdited] = useState<Slot[]>([])
  const closeGearSwapper = () => {
    setShowEquipmentModal(false)
  }

  const handleChangeGearSwapper = (change: () => void, actionType: 'equip' | 'unequip') => {
    closeGearSwapper()
    change()
  }

  const equippedGearFields = useMemo(() => {
    const { equippedItems, itemSlots, getItemQuantity } = character.inventory

    return Object.entries(itemSlots).map(([slotKey, itemUUID]) => {
      const handleEquipmentButtonPress = () => {
        setShowEquipmentModal(true)
        setSlotBeingEdited([slotKey] as Slot[])
      }
      const equippedItem = equippedItems.find(item => item.uuid === itemUUID)
      const itemName = equippedItem ? equippedItem.name : '-'
      const itemLabel =
        equippedItem?.rangedAttack && !equippedItem.rangedAmmunition
          ? `${itemName} (${getItemQuantity(equippedItem._id)})`
          : itemName
      let ammunitionLabel
      let accessibilityAmmunitionLabel

      if (equippedItem?.rangedAmmunition) {
        const ammunitionQuantity = getItemQuantity(equippedItem.rangedAmmunition)
        const ammunitionName = t(`ITEM-${equippedItem.rangedAmmunition}-NAME`)
        const ammunitionTruncatedName = truncate(ammunitionName, 9)
        ammunitionLabel = `${ammunitionTruncatedName} (${ammunitionQuantity})`
        accessibilityAmmunitionLabel = `(${t('INVENTORY-AMMUNITION')}: ${ammunitionName}, ${t('INVENTORY-QUANTITY')}: ${ammunitionQuantity})`
      }

      const accessibilityLabel = `${equippedItem?.name || t('CHARACTER-OVERVIEW-GEAR-SLOT-EMPTY-LABEL')} ${
        accessibilityAmmunitionLabel || ''
      }`

      const valueComponent = (
        <View style={style.gearFieldsValueWrapper}>
          <Button
            accessibilityLabel={accessibilityLabel}
            label={itemLabel}
            size="mini"
            wrapperStyle={[
              style.gearFieldsValueButtonWrapper,
              { marginRight: ammunitionLabel ? 5 : 0 }
            ]}
            labelStyle={style.gearFieldsValueButtonLabel}
            onPress={handleEquipmentButtonPress}
          />
          {equippedItem?.rangedAmmunition && (
            <View accessible={false} style={style.gearFieldsValueAmmunitionWrapper}>
              <Text style={style.gearFieldsValueAmmunitionText}>{ammunitionLabel}</Text>
            </View>
          )}
        </View>
      )

      return {
        label: t(`INVENTORY-SLOT-${camelCaseToConstCase(slotKey)}`),
        value: valueComponent
      }
    })
  }, [character.inventory.equippedItems])

  const combatActions = useMemo(() => {
    const {
      inventory: { equippedItems }
    } = character

    return equippedItems.length ? (
      equippedItems
        .reduce(
          (combatActionIds: TCombatActionId[], item) =>
            item.suppliedCombatActionIds
              ? combatActionIds.concat(
                  item.suppliedCombatActionIds.filter(id => !combatActionIds.includes(id))
                )
              : combatActionIds,
          []
        )
        .map(id => (
          <CombatActionTooltip
            key={id}
            id={id}
            wrapperStyle={{ marginRight: variables.distance / 2 }}
          />
        ))
    ) : (
      <Text style={style.combatActionsEmpty}>
        {t('CHARACTER-OVERVIEW-GEAR-ABILITIES-NO-ABILITIES')}
      </Text>
    )
  }, [JSON.stringify(character.inventory.equippedItems.map(item => item._id))])

  const renderStatPrefix = (attributeName: TAttribute) => {
    return (
      <RoundButton
        color={colors.azure}
        label="+"
        accessibilityLabel={t('CHARACTER-OVERVIEW-SPEND-STAT-LABEL', { attributeName })}
        onPress={() => character.spendStatPoint(attributeName)}
      />
    )
  }

  const renderStatSuffix = (stat: IntegerAttribute) => {
    const value = stat.value - stat.baseValue
    const valuePrefix = value > 0 ? '+' : ''

    return value ? (
      <Text style={style.attributeSuffix}>{value === 0 ? '' : `${valuePrefix}${value}`}</Text>
    ) : null
  }

  return (
    <View style={style.wrapper}>
      <AccessibilityFocus id="CharacterScreenHeader" focusOnUpdate={false}>
        <Text ref={_ui.setAccessibilityRef} style={style.headline}>
          {t('CHARACTER-LEVEL')} {character.level}
        </Text>
      </AccessibilityFocus>

      {character.unspentStatPoints > 0 && (
        <Text style={style.unspentNotice}>
          <Trans
            t={t}
            i18nKey={'CHARACTER-STATS-UNSPENT_POINTS-NOTICE'}
            count={character.unspentStatPoints}
            components={{
              strong: <Text style={style.unspent} />
            }}
          />
        </Text>
      )}

      <View style={[style.experience, style.section]}>
        <ProgressBar
          accessibilityLabel={t('CHARACTER-EXPERIENCE')}
          value={character.experience}
          maxValue={character.nextLevel}
          showValuesOnPress
          valuesLabel={t('CHARACTER-EXPERIENCE')}
        />
      </View>

      <ScrollView>
        <A11y.Order style={[style.stats, style.section]}>
          <A11y.Index style={{ width: '45%' }} index={1}>
            <Fieldset
              legend={t('CHARACTER-ATTRIBUTES')}
              legendSuffix={<Tooltip content={t('HELP-TEXT-ATTRIBUTES')} />}
              valueStyle={{ width: 30, textAlign: 'right' }}
              fields={attributes.map(statName => {
                const label = t(`CHARACTER-ATTRIBUTE-${statName.toUpperCase()}`)

                return {
                  label,
                  value: character.attributes[statName as TAttribute].baseValue,
                  prefix:
                    character.unspentStatPoints > 0 && renderStatPrefix(statName as TAttribute),
                  suffix: renderStatSuffix(character.attributes[statName as TAttribute])
                }
              })}
            />
          </A11y.Index>
          <A11y.Index style={{ width: '45%' }} index={2}>
            <Fieldset
              legend={t('CHARACTER-DERIVATIVES')}
              legendSuffix={<Tooltip content={t('HELP-TEXT-DERIVATIVES')} />}
              fields={[
                {
                  label: t('CHARACTER-DERIVATIVE-HEALTH_POINTS-SHORT'),
                  value: `${character.health} / ${character.maxHealth}`
                },
                {
                  label: t('CHARACTER-DERIVATIVE-PROTECTION'),
                  value: character.protection
                },
                {
                  label: t('CHARACTER-DERIVATIVE-SPEED'),
                  value: character.speed.toFixed(1)
                },
                {
                  label: t('CHARACTER-DERIVATIVE-BLOCK_CHANCE'),
                  value: `${parseInt((character.blockChance * 100).toFixed(0))}%`
                },
                {
                  label: t('CHARACTER-DERIVATIVE-ENCUMBRANCE'),
                  prefix: character.overEncumbered && (
                    <Icon
                      width={warningIconSize}
                      height={warningIconSize}
                      name="warning"
                      fill={variables.colors.turmeric}
                      style={style.derivativeWarningIcon}
                    />
                  ),
                  value: `${character.encumbrance} / ${character.stats.maxEncumbrance.value}`
                }
              ]}
            />
          </A11y.Index>
        </A11y.Order>
        <View style={[style.attacks, style.section]}>
          <Attacks character={character} />
        </View>
        <View style={[style.gear, style.section]}>
          <Fieldset
            legend={t('CHARACTER-OVERVIEW-EQUIPMENT-LABEL')}
            fields={equippedGearFields}
            valueWrapperStyle={style.equippedGearFieldsWrapper}
            fieldStyle={style.equippedGearFieldsWrapper}
            keyStyle={style.equippedGearFieldsKey}
          />
        </View>
        <View style={[style.combatActions, style.section]}>
          <Fieldset
            legendSuffix={<Tooltip content={t('HELP-TEXT-COMBAT_ACTIONS-PREFIX')} />}
            legend={t('CHARACTER-OVERVIEW-GEAR-ABILITIES')}
            fields={[]}
          >
            <View style={style.combatActionsWrapper}>{combatActions}</View>
          </Fieldset>
        </View>
      </ScrollView>
      <GearSwapper
        visible={showEquipmentModal}
        close={closeGearSwapper}
        slots={slotBeingEdited}
        onChangeWrapper={handleChangeGearSwapper}
      />
    </View>
  )
})
