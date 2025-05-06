import type { Character, TCharacterAttackSet } from '@actnone/eldrum-engine/models'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Fieldset } from '@actnone/eldrum-engine/components'
import style from './attacks.style'

const NOT_APPLICABLE_LABEL = '–'

const Attacks = ({ character }: { character: Character }) => {
  const { t } = useTranslation()
  const formatAttackSets = (attackSet: TCharacterAttackSet[]) =>
    attackSet
      .flatMap(weaponAttackSets => {
        const weaponSets =
          attackSet.length > 1
            ? weaponAttackSets.filter(attackSet => !!attackSet.item)
            : weaponAttackSets

        return weaponSets.map(set =>
          `${set.damage.min}-${set.damage.max} ${set.ranged ? t('CHARACTER-DERIVATIVE-RANGED_DAMAGE-SHORT') : t('CHARACTER-DERIVATIVE-MELEE_DAMAGE-SHORT')}`.toLowerCase()
        )
      })
      .join(' • ')
  const mainHand = character.inventory.equippedItemsBySlot.find(item => item.slot === 'mainHand')
  const offHand = character.inventory.equippedItemsBySlot.find(item => item.slot === 'offHand')
  const mainHandAttackSets =
    mainHand?.item?.type === 'weapon'
      ? formatAttackSets(character.attacks.getAttackSets([mainHand.item], character))
      : offHand?.item?.type !== 'weapon'
        ? formatAttackSets([character.attacks.getFallbackAttackSet(character)])
        : NOT_APPLICABLE_LABEL
  const offHandAttackSets =
    offHand?.item?.type === 'weapon'
      ? formatAttackSets(character.attacks.getAttackSets([offHand.item], character))
      : mainHand?.item?.type !== 'weapon' && offHand?.item?.type !== 'shield'
        ? formatAttackSets([character.attacks.getFallbackAttackSet(character)])
        : NOT_APPLICABLE_LABEL
  const isTwoHandedWeapon =
    mainHand?.item?.defaultSlots.includes('mainHand') &&
    mainHand?.item?.defaultSlots.includes('offHand')
  const attacks = isTwoHandedWeapon
    ? [
        {
          label: t('CHARACTER-GEAR-HANDS-TWO_HANDED-LABEL'),
          value: mainHandAttackSets
        }
      ]
    : [
        {
          label: t('CHARACTER-GEAR-HANDS-MAIN_HAND-LABEL'),
          value: mainHandAttackSets
        },
        {
          label: t('CHARACTER-GEAR-HANDS-OFF_HAND-LABEL'),
          value: offHandAttackSets
        }
      ]

  return (
    <Fieldset
      legend={t('CHARACTER-OVERVIEW-DAMAGE-LABEL')}
      fields={attacks}
      keyStyle={style.keyWrapper}
      valueWrapperStyle={style.valueWrapper}
      valueStyle={field => field.value === NOT_APPLICABLE_LABEL && style.emptyValue}
    />
  )
}

export default Attacks
