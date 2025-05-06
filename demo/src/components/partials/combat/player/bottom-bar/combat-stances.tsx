import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import { combatStanceNames } from '~demo/models/combat/combat-stances'
import { Card } from '@actnone/eldrum-engine/components'
import { CombatInfoBox } from '~demo/components/units'
import { variables } from '@actnone/eldrum-engine/styles'
import style from './combat-stances.style'

interface ICombatStancesProps {
  current: string | undefined
  changeCurrentStance: (name: string) => void
}

const CombatStances: React.FC<ICombatStancesProps> = ({ changeCurrentStance, current }) => {
  const { t } = useTranslation()

  return (
    <View style={style.wrapper}>
      {combatStanceNames.map(stanceName => {
        const effectIdUppercase = stanceName.toUpperCase() as Uppercase<typeof stanceName>
        const name = t(`EFFECT-${effectIdUppercase}-NAME`)
        const description = t(`EFFECT-${effectIdUppercase}-DESC`)
        const flavor = t(`EFFECT-${effectIdUppercase}-FLAVOR`)

        return (
          <TouchableOpacity
            accessible
            accessibilityRole="button"
            onPress={() => changeCurrentStance(stanceName)}
            key={stanceName}
            style={style.buttonWrapper}
          >
            <Card tint="#000" corners="all" cornerSize={variables.distance * 1.5}>
              <CombatInfoBox
                cost={{ actionPoints: 1 }}
                icon={stanceName}
                title={
                  stanceName === current
                    ? `${name} (${t('COMBAT-ACTION-STANCE_SWAP-ACTIVE_SUFFIX')})`
                    : name
                }
                description={description}
                flavorText={flavor}
              />
            </Card>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export default CombatStances
