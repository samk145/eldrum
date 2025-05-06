import type { TCombatActionId } from '~demo/models/combat/combat-actions'
import React, { memo, useState } from 'react'
import { View, type ViewStyle } from 'react-native'
import { useTranslation } from 'react-i18next'
import { getClass } from '~demo/models/combat/combat-actions'
import { variables, dimensions as screenDimensions } from '@actnone/eldrum-engine/styles'
import { useDimensions } from '@actnone/eldrum-engine/hooks'
import { Text, RoundButton, CardModal } from '@actnone/eldrum-engine/components'
import { CombatInfoBox } from '../combat-info-box/combat-info-box'
import style, { customButtonSize } from './combat-action-tooltip.style'
import { Icon } from '../icon/icon'

type TCombatActionProps = {
  id: TCombatActionId
  backgroundColor?: string
  wrapperStyle?: ViewStyle
}

export const CombatActionTooltip = memo(function CombatActionTooltip({
  id,
  wrapperStyle,
  backgroundColor = variables.colors.nightLight
}: TCombatActionProps) {
  const { t } = useTranslation()
  const [visible, setVisibility] = useState(false)
  const open = () => setVisibility(true)
  const close = () => setVisibility(false)
  const actionIdUppercase = id.toUpperCase() as Uppercase<typeof id>
  const name = t(`COMBAT_ACTION-${actionIdUppercase}-NAME`)
  const description = t(`COMBAT_ACTION-${actionIdUppercase}-DESC`)
  const flavor = t(`COMBAT_ACTION-${actionIdUppercase}-FLAVOR`)
  const CombatAction = getClass(id)
  const dimensions = useDimensions()

  const defensiveEffects = 'effects' in CombatAction ? CombatAction.effects : []
  const offensiveEffects =
    'particleEffects' in CombatAction
      ? CombatAction.particleEffects.map(particleEffect =>
          typeof particleEffect === 'string' ? particleEffect : particleEffect.name
        )
      : []

  return (
    <View style={[style.wrapper, wrapperStyle]}>
      <RoundButton
        accessibilityLabel={name}
        customSize={customButtonSize}
        touchSoundDisabled={true}
        onPress={open}
        color={backgroundColor}
        icon={props => (
          <Icon name={id} {...props} height={style.icon.height} width={style.icon.width} />
        )}
      />
      <Text accessible={false} style={style.label}>
        {name}
      </Text>
      <CardModal
        visible={visible}
        onHandleDragSuccess={close}
        onOverlayPress={close}
        useHandler
        useOverlay
        index={5}
        overlayOpacity={0.1}
      >
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: -variables.distance,
            marginBottom: dimensions.insets.bottom + variables.distance,
            paddingVertical: variables.distance
          }}
        >
          <View
            style={{
              width: variables.distance * 20,
              maxWidth: screenDimensions.width
            }}
          >
            <CombatInfoBox
              title={name}
              description={description}
              flavorText={flavor}
              icon={id}
              cost={{ advantage: CombatAction.cost, actionPoints: 1 }}
              effects={[...defensiveEffects, ...offensiveEffects]}
            />
          </View>
        </View>
      </CardModal>
    </View>
  )
})
