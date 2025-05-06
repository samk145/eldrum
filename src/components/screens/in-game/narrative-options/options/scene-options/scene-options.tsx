import React from 'react'
import { observer } from 'mobx-react'
import { useGameStore } from '../../../../../../contexts/stores'
import OptionButton from '../option/option'

const SceneOptions = () => {
  const { scene } = useGameStore()

  return (
    <>
      {scene.node.availableOptions.map(option => (
        <OptionButton option={option} key={`${scene.node._id}-${option._id}`} />
      ))}
    </>
  )
}

export default observer(SceneOptions)
