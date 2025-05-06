import type SceneOption from '../../../../../../models/scene/option'

import React, { useCallback } from 'react'
import { observer } from 'mobx-react'
import { useGameStore } from '../../../../../../contexts/stores'
import { Button } from '../../../../../units'
import style from '../options.style'

export const BUTTON_ANIMATION_DURATION = 250

const Option = ({ option }: { option: SceneOption }) => {
  const game = useGameStore()
  const onPress = useCallback(
    () => !game.puppeteer.ending && game.scene.executeOption(option),
    [option, game.puppeteer.ending]
  )

  return (
    <Button
      onLoadAnimationDuration={BUTTON_ANIMATION_DURATION}
      wrapperStyle={style.optionWrapper}
      used={option.usageCount > 0}
      label={option.currentLabel}
      onPress={onPress}
    />
  )
}

export default observer(Option)
