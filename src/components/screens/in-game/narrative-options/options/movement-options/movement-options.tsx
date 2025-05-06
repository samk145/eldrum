import type { EditorPath } from '@actnone/eldrum-editor/dist/types'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { observer } from 'mobx-react'
import { useGameStore } from '../../../../../../contexts/stores'
import { Button } from '../../../../../units'
import { BUTTON_ANIMATION_DURATION } from '../option/option'
import optionStyle from '../options.style'

const MovementOption = ({ path }: { path: EditorPath }) => {
  const { t } = useTranslation()
  const game = useGameStore()
  const onPress = useCallback(() => game.movement.executePathOption(path), [path._id])
  const labelIndex = Math.max(game.getUsageValueIndex('path', path), 0)
  const label = t(`PATH-${path._id}-LABEL-${labelIndex}`, { ns: 'world' })
  const used = game.statistics.hasUsedMovementOption(path._id)

  return (
    <Button
      onLoadAnimationDuration={BUTTON_ANIMATION_DURATION}
      wrapperStyle={optionStyle.optionWrapper}
      used={used}
      label={label}
      onPress={onPress}
    />
  )
}

const MovementOptions = () => {
  const game = useGameStore()

  return (
    <>
      {game.movement.movementOptions.map(path => (
        <MovementOption key={path._id} path={path} />
      ))}
    </>
  )
}

export default observer(MovementOptions)
