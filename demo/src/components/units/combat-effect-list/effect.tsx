import React, { useCallback, useMemo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { observer } from 'mobx-react'
import { useTranslation } from 'react-i18next'
import { Rect } from '@actnone/eldrum-engine/helpers'
import {
  Text,
  PopoverTrigger,
  type TPopoverTriggerRenderFn
} from '@actnone/eldrum-engine/components'
import { CombatInfoBox } from '../combat-info-box/combat-info-box'
import { Icon } from '../icon/icon'
import { type EffectGroup } from './combat-effect-list'
import style from './effect.style'

const hitSlop = Rect(7, 7, 7, 7)

type TEffectProps = {
  effectGroup: EffectGroup
  small?: boolean
}

function Effect({ effectGroup, small = false }: TEffectProps) {
  const { t } = useTranslation()
  const shouldShowQuantityLabel = effectGroup.quantity > 1
  const effectIdAsUppercase = effectGroup.id.toUpperCase() as Uppercase<typeof effectGroup.id>
  const title = t(`EFFECT-${effectIdAsUppercase}-NAME`)
  const description = t(`EFFECT-${effectIdAsUppercase}-DESC`)

  const popoverContent = useMemo(
    () => <CombatInfoBox title={title} icon={effectGroup.id} description={description} />,
    []
  )

  const popoverTriggerRender: TPopoverTriggerRenderFn = useCallback(
    popoverTriggerProps => {
      return (
        <TouchableOpacity
          hitSlop={hitSlop}
          delayLongPress={popoverTriggerProps.delayLongPress}
          onLongPress={popoverTriggerProps.onLongPress}
          onPressIn={popoverTriggerProps.onPressIn}
          onPressOut={popoverTriggerProps.onPressOut}
          touchSoundDisabled={true}
        >
          <Icon
            name={effectGroup.id}
            height={small ? style.iconSmall.height : style.icon.height}
            width={small ? style.iconSmall.width : style.icon.width}
            fill="#fff"
          />
          {shouldShowQuantityLabel && (
            <View style={[style.quantityWrapper, small && style.quantityWrapperSmall]}>
              <Text style={[style.quantityLabel, small && style.quantityLabelSmall]}>
                {effectGroup.quantity}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )
    },
    [shouldShowQuantityLabel, effectGroup.quantity, effectGroup.id]
  )

  return (
    <View style={[small ? style.smallWrapper : style.wrapper]}>
      <PopoverTrigger scale={4} content={popoverContent} render={popoverTriggerRender} />
    </View>
  )
}

export default observer(Effect)
