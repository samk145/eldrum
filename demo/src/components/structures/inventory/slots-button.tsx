import type { TSlotSets } from '@actnone/eldrum-engine/models'
import React, { useState } from 'react'
import { View } from 'react-native'
import { truncate, camelCaseToConstCase } from '@actnone/eldrum-engine/helpers'
import { useDimensions } from '@actnone/eldrum-engine/hooks'
import { variables } from '@actnone/eldrum-engine/styles'
import { useTranslation } from 'react-i18next'
import { Button, CardModal, Text } from '@actnone/eldrum-engine/components'
import style from './slots-button.style'

const SlotsButton = ({
  slotSets = [],
  onChange,
  value,
  disabled
}: {
  slotSets: TSlotSets
  onChange: (index: number) => void
  value: number
  disabled: boolean
}) => {
  const { t } = useTranslation()
  const [modalVisible, setModalVisible] = useState(false)
  const { insets } = useDimensions()
  const slotsButtonLabel = truncate(
    slotSets[value]
      .map(slotName => t(`INVENTORY-SLOT-${camelCaseToConstCase(slotName)}`))
      .join(' + '),
    20
  )
  const options = slotSets.map((slotSet, index) => ({
    value: index,
    label: slotSet
      .map(slotName => t(`INVENTORY-SLOT-${camelCaseToConstCase(slotName)}`))
      .join(' + ')
  }))
  const show = () => setModalVisible(true)
  const hide = () => setModalVisible(false)
  const isDisabled = disabled || slotSets.length === 1

  return (
    <>
      <Button
        accessibilityLabel={t(
          isDisabled
            ? 'INVENTORY-SLOT_SELECTOR-BUTTON-A11Y_LABEL-DISABLED'
            : 'INVENTORY-SLOT_SELECTOR-BUTTON-A11Y_LABEL',
          {
            slotNames: slotsButtonLabel
          }
        )}
        disabled={isDisabled}
        tint={isDisabled ? variables.colors.night : undefined}
        onPress={show}
        icon={isDisabled ? undefined : 'replace'}
        size="small"
        label={slotsButtonLabel}
      />
      <CardModal
        visible={modalVisible}
        onHandleDragSuccess={hide}
        useOverlay
        onOverlayPress={hide}
        index={1}
      >
        <View style={[style.wrapper, { marginBottom: insets.bottom }]}>
          <Text style={style.headline}>{t('INVENTORY-SLOT_SELECTOR-TITLE')}</Text>
          {options.map(({ value, label }) => {
            const onPress = () => {
              onChange(value)
              hide()
            }

            return (
              <Button key={label} label={label} onPress={onPress} wrapperStyle={style.slotButton} />
            )
          })}
        </View>
      </CardModal>
    </>
  )
}

export default SlotsButton
