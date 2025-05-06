import type { TEquipChanges } from '@actnone/eldrum-engine/models'
import type { TDemoItem } from '~demo/models/item'

import React from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { observer } from 'mobx-react'
import {
  camelCaseToConstCase,
  capitalizeCamelCase,
  formatPercentage
} from '@actnone/eldrum-engine/helpers'
import { useGameStore } from '@actnone/eldrum-engine/contexts'
import { variables } from '@actnone/eldrum-engine/styles'
import { Card, Icon, Text } from '@actnone/eldrum-engine/components'
import { CombatActionTooltip } from '../../units'
import ItemStat from './item-stat'
import { COLOR_BAD } from './item-stat.style'
import style, { CARD_TINT, CARD_CORNER_RADIUS } from './item-stats.style'
import { formatStatModifier, formatUsageValue } from './helpers'
import { attributes } from '@actnone/eldrum-engine/models'

const ItemStats = ({ item, equipChanges }: { item: TDemoItem; equipChanges?: TEquipChanges }) => {
  const { t } = useTranslation()
  const game = useGameStore()
  const { character } = game

  const hasCombatActions = !!(
    item.suppliedCombatActionIds && item.suppliedCombatActionIds.length > 0
  )

  const willUnequipNotice = (function () {
    if (equipChanges && equipChanges.willUnEquip.length) {
      const items = equipChanges.willUnEquip
      const name = items[0].name

      if (items.length === 1) {
        return t('INVENTORY-EQUIP-REPLACES_SINGLE_ITEM-LABEL', { itemName: name })
      } else if (items.length === 2) {
        return t('INVENTORY-EQUIP-REPLACES_TWO_ITEMS-LABEL', { itemName: name })
      } else {
        return t('INVENTORY-EQUIP-REPLACES_TWO_ITEMS-LABEL', {
          itemName: name,
          quantity: items.length - 1
        })
      }
    }
  })()

  const currentQuantity =
    item.rangedAmmunition && character.inventory.getItemQuantity(item.rangedAmmunition)

  const itemTraitDescriptions = item.traits
    ? item.traits.map(traitId => t(`ITEM_TRAIT-${camelCaseToConstCase(traitId)}-DESC`))
    : []

  return (
    <Card tint={CARD_TINT} corners="all" cornerSize={CARD_CORNER_RADIUS} style={style.wrapper}>
      {hasCombatActions && (
        <View style={style.combatActionsWrapper}>
          {item.suppliedCombatActionIds.map(id => (
            <CombatActionTooltip key={id} id={id} wrapperStyle={style.combatAction} />
          ))}
        </View>
      )}

      <View style={[style.stats, hasCombatActions && style.statsWithCombatActions]}>
        {typeof item.armor === 'number' && (
          <ItemStat
            type="main"
            label={t('INVENTORY-ITEM-ARMOR-LABEL')}
            value={item.armor}
            equipChange={equipChanges && equipChanges.armor}
          />
        )}
        {item.meleeAttack && (
          <ItemStat
            type="main"
            label={t('INVENTORY-ITEM-DAMAGE-MELEE-LABEL')}
            value={`${item.meleeAttack.damage.min}–${item.meleeAttack.damage.max}`}
            accessibilityLabel={`${t('INVENTORY-ITEM-DAMAGE-MELEE-LABEL')}: ${t(
              'INVENTORY-ITEM-NUMERIC_VALUE_BETWEEN-A11Y_LABEL',
              {
                fromValue: item.meleeAttack.damage.min,
                toValue: item.meleeAttack.damage.max
              }
            )}`}
            equipChange={equipChanges && equipChanges.meleeDamage}
          />
        )}
        {item.rangedAttack && (
          <ItemStat
            type="main"
            label={t('INVENTORY-ITEM-DAMAGE-RANGED-LABEL')}
            value={`${item.rangedAttack.damage.min}–${item.rangedAttack.damage.max}`}
            accessibilityLabel={`${t('INVENTORY-ITEM-DAMAGE-RANGED-LABEL')}: ${t(
              'INVENTORY-ITEM-NUMERIC_VALUE_BETWEEN-A11Y_LABEL',
              {
                fromValue: item.rangedAttack.damage.min,
                toValue: item.rangedAttack.damage.max
              }
            )}`}
            equipChange={equipChanges && equipChanges.rangedDamage}
          />
        )}
        {item.blockChance && (
          <ItemStat
            type="main"
            label={t('CHARACTER-DERIVATIVE-BLOCK_CHANCE')}
            value={formatPercentage(item.blockChance)}
            equipChange={equipChanges && equipChanges.blockChance}
          />
        )}
        {item.consumption?.uses && (
          <React.Fragment>
            <ItemStat
              type="main"
              value={
                item.consumption && item.consumption.uses > 1
                  ? t('INVENTORY-ITEM-USES-LABEL', { quantity: formatUsageValue(item) })
                  : t('INVENTORY-ITEM-USES_SINGLE-LABEL')
              }
            />
            {item.consumption?.actions &&
              (() => {
                const consumedCount = game.statistics.getRecord('consumedItems', item._id)

                if (consumedCount === 0) {
                  return (
                    <ItemStat
                      type="secondary"
                      label={t('INVENTORY-ITEM-CONSUME-UNKNOWN_EFFECTS')}
                      textStyle={{
                        color: variables.colors.gloom,
                        fontFamily: variables.fonts.defaultItalic
                      }}
                    />
                  )
                }

                return (
                  <>
                    {item.consumption.actions.map((action, index) => {
                      let consumeEffectLabel = ''
                      let textColor = variables.colors.turmeric

                      switch (action.type) {
                        case 'changeHealth':
                        case 'changeHealthLimited': {
                          const [value] = action.parameters
                          if (value > 0) {
                            consumeEffectLabel = t('INVENTORY-ITEM-CONSUME-RESTORE_HEALTH', {
                              value
                            })
                            textColor = variables.colors.emerald
                          } else {
                            consumeEffectLabel = t('INVENTORY-ITEM-CONSUME-REDUCE_HEALTH', {
                              value: Math.abs(value)
                            })
                            textColor = COLOR_BAD
                          }
                          break
                        }
                        case 'gainFullHealth': {
                          consumeEffectLabel = t('INVENTORY-ITEM-CONSUME-RESTORE_FULL_HEALTH')
                          textColor = variables.colors.emerald
                          break
                        }
                        case 'gainExperience': {
                          consumeEffectLabel = t('INVENTORY-ITEM-CONSUME-GAIN_EXPERIENCE', {
                            value: action.parameters[0]
                          })
                          break
                        }
                        case 'changeStat': {
                          const [stat, value] = action.parameters
                          consumeEffectLabel = t('INVENTORY-ITEM-CONSUME-CHANGE_STAT', {
                            stat: t(`CHARACTER-ATTRIBUTE-${stat.toUpperCase()}`),
                            value
                          })
                          break
                        }
                        case 'addEffect': {
                          const [effect] = action.parameters
                          const effectUppercase = camelCaseToConstCase(effect)
                          consumeEffectLabel = t('INVENTORY-ITEM-CONSUME-ADD_EFFECT', {
                            effectName: t(`EFFECT-${effectUppercase}-NAME`)
                          })
                          break
                        }
                      }

                      return consumeEffectLabel ? (
                        <ItemStat
                          key={index}
                          type="secondary"
                          label={consumeEffectLabel}
                          textStyle={{ color: textColor }}
                        />
                      ) : null
                    })}
                  </>
                )
              })()}
          </React.Fragment>
        )}

        {typeof item.encumbrance === 'number' && item.encumbrance > 0 && (
          <ItemStat
            type="secondary"
            label={t('CHARACTER-DERIVATIVE-ENCUMBRANCE')}
            value={item.encumbrance}
            showWarning={
              equipChanges
                ? equipChanges.encumbrance.toValue > equipChanges.maxEncumbrance.fromValue
                : false
            }
          />
        )}

        {item.rangedAmmunition && (
          <ItemStat
            type="secondary"
            label={t('INVENTORY-ITEM-AMMUNITION_REQUIREMENT-PREFIX')}
            value={`${t(`ITEM-${item.rangedAmmunition}-NAME`, { ns: 'items' })} (${currentQuantity})`}
            showWarning={!currentQuantity}
          />
        )}

        {item.sideEffects?.statModifiers?.map((modifier, index) => {
          const isIncrease = !!(
            (modifier.type === 'term' && modifier.value > 0) ||
            (modifier.type === 'factor' && modifier.value > 1)
          )
          const isAttribute = attributes.includes(modifier.statName as (typeof attributes)[number])
          const label = isAttribute
            ? t(`CHARACTER-ATTRIBUTE-${modifier.statName.toUpperCase()}`)
            : t(`CHARACTER-DERIVATIVE-${camelCaseToConstCase(modifier.statName)}`)

          return (
            <ItemStat
              key={index}
              type="secondary"
              label={label}
              value={formatStatModifier(modifier.value, modifier.statName, modifier.type)}
              textStyle={{ color: isIncrease ? variables.colors.turmeric : COLOR_BAD }}
            />
          )
        })}

        {item.sideEffects?.immunities?.map(effectId => {
          return (
            <ItemStat
              key={effectId}
              type="secondary"
              label={t('INVENTORY-ITEM-STATS-GRANTS_IMMUNITY-LABEL')}
              value={capitalizeCamelCase(effectId)}
              textStyle={{ color: variables.colors.turmeric }}
            />
          )
        })}

        {itemTraitDescriptions?.map((itemTraitDescription, i) => {
          return (
            <ItemStat
              key={i}
              type="secondary"
              label={itemTraitDescription}
              textStyle={{ color: variables.colors.viola }}
            />
          )
        })}
      </View>

      {willUnequipNotice && (
        <View style={style.bottom}>
          <Icon name="replace" height={8} width={8} />
          <Text style={style.willUnEquipText}>{willUnequipNotice}</Text>
        </View>
      )}
    </Card>
  )
}

export default observer(ItemStats)
