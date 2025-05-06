import type { ViewProps } from 'react-native'
import type { TDemoEffect } from '~demo/models/character/effects'

import React from 'react'
import { View } from 'react-native'
import { t } from 'i18next'
import { observable, action, computed, reaction } from 'mobx'
import { observer } from 'mobx-react'
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'
import style from './combat-effect-list.style'
import Effect from './effect'

const ANIMATION_DURATION = 200

const getAccessibilityLabel = (effectsGroups: EffectGroup[]) =>
  effectsGroups
    .map(effectGroup =>
      effectGroup.quantity > 1 ? `${effectGroup.id} (${effectGroup.quantity})` : effectGroup.id
    )
    .join()

export class EffectGroup {
  constructor(private readonly effect: TDemoEffect) {
    this.id = effect.id
    this.effects = [effect]
  }

  id: TDemoEffect['id']
  @observable effects: TDemoEffect[]

  @action
  resetEffectsArray() {
    this.effects = []
  }

  @action
  addEffect(e: TDemoEffect) {
    this.effects.push(e)
  }

  @action
  removeEffect(effectUUID: string) {
    this.effects = this.effects.filter(currentEffect => currentEffect.uuid !== effectUUID)
  }

  get uuids() {
    return this.effects.map(e => e.uuid)
  }

  @computed
  get quantity() {
    return this.effects.length
  }
}

type TCombatEffectListProps = {
  effects: TDemoEffect[]
  small?: boolean
} & ViewProps

// The reason this component was reverted back to a class component
// is because the following implementation of observable state in a
// functional component is not working correctly
// https://mobx.js.org/react-integration.html#:~:text=%60useState%60%20with%20local%20observable%20object
@observer
export class CombatEffectList extends React.Component<TCombatEffectListProps> {
  @observable effectGroups: EffectGroup[] = []

  @action
  createNewEffectGroup = (effect: TDemoEffect) => {
    const effectGroup = new EffectGroup(effect)
    this.effectGroups.push(effectGroup)
  }

  @action
  removeAllEffectGroups = () => {
    this.effectGroups = []
  }

  @action
  removeEffectGroup = (id: TDemoEffect['id']) => {
    this.effectGroups.forEach((group, index) => {
      if (group.id === id) {
        this.effectGroups.splice(index, 1)
      }
    })
  }

  onNewEffect = reaction(
    () => this.props.effects.map(e => e.uuid),
    async uuids => {
      const { effectGroups } = this
      const { effects } = this.props

      // Remove old effects
      if (!effects.length) {
        this.removeAllEffectGroups()
      } else {
        // This is done in reverse to prevent issues stemming from removing items from
        // an array while iterating over it
        // see https://coderwall.com/p/prvrnw/remove-items-from-array-while-iterating-over-it
        for (let i = effectGroups.length - 1; i >= 0; --i) {
          const effectGroup = effectGroups[i]
          const shouldEffectGroupExist = effects.find(e => e.id === effectGroup.id)

          // Remove Groups that no longer exist
          if (!shouldEffectGroupExist) {
            this.removeEffectGroup(effectGroup.id)
          }

          // Remove "effects that no longer exist" from group
          effectGroup.effects.forEach(effect => {
            const effectStillExists = effects.find(e => e.uuid === effect.uuid)

            if (!effectStillExists) {
              effectGroup.removeEffect(effect.uuid)
            }
          })
        }
      }

      // Add new effects to effectGroups
      effects.forEach(effect => {
        const effectGroupExists = effectGroups.find(effectGroup => effectGroup.id === effect.id)

        if (effectGroupExists) {
          if (!effectGroupExists.uuids.includes(effect.uuid)) {
            effectGroupExists.addEffect(effect)
          }
        }

        if (!effectGroupExists && effect.visible) {
          this.createNewEffectGroup(effect)
        }
      })
    },
    {
      fireImmediately: true,
      name: 'onNewEffect'
    }
  )

  render() {
    const { effectGroups } = this
    const { small, effects, ...rest } = this.props

    return (
      <View
        accessible
        accessibilityLabel={`${t('EFFECTS-LABEL')}: ${getAccessibilityLabel(effectGroups)}`}
        style={[style.wrapper, small && style.smallWrapper]}
        {...rest}
      >
        {effectGroups.map((group, index) => (
          <Animated.View
            layout={LinearTransition.duration(ANIMATION_DURATION)}
            entering={FadeIn.duration(ANIMATION_DURATION)}
            exiting={FadeOut.duration(ANIMATION_DURATION / 2)}
            key={group.id}
            style={{ zIndex: -index }}
          >
            <Effect effectGroup={group} small={small} />
          </Animated.View>
        ))}
      </View>
    )
  }
}
