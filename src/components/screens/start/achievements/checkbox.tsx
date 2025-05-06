import React from 'react'
import { View } from 'react-native'
import { Icon } from '../../../units'
import style from './checkbox.style'

type TCheckboxProps = {
  isComplete: boolean
  size: number
}

const Checkbox = ({ isComplete, size }: TCheckboxProps) => {
  const padding = size / 4
  const iconSize = size - padding * 2

  return (
    <View
      accessible={false}
      style={[
        style.wrapper,
        { height: size, width: size, padding },
        isComplete && style.wrapperIsChecked
      ]}
    >
      {isComplete && <Icon name="checkmark" height={iconSize} width={iconSize} />}
    </View>
  )
}

export default Checkbox
