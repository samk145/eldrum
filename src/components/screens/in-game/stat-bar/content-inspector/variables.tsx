import React from 'react'
import { View, ScrollView } from 'react-native'
import { useGameStore } from '../../../../../contexts/stores'
import { Fieldset } from '../../../../units'
import style from './style'

const Variables = () => {
  const game = useGameStore()

  return (
    <ScrollView>
      <View style={style.section}>
        <Fieldset
          fields={game.variables.list.map(variable => ({
            label: variable.name,
            value: JSON.stringify(variable.value)
          }))}
          legend="Variables"
          hideEmpty={false}
          hideEmptyFields={false}
        ></Fieldset>
      </View>
    </ScrollView>
  )
}

export default Variables
