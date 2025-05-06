import React from 'react'
import { View, ScrollView } from 'react-native'
import { observer } from 'mobx-react'
import { useGameStore } from '../../../../../contexts/stores'
import { variables } from '../../../../../styles'
import { attributes } from '../../../../../models/character/attributes'
import { Fieldset, Text, Button } from '../../../../units'
import PickUpItemWidget from './pick-up-item-widget'
import ActorDerivatives from './actor-derivatives'
import style from './style'

const Character = observer(() => {
  const game = useGameStore()

  return (
    <ScrollView>
      <View style={style.section}>
        <Fieldset
          fields={[]}
          legend="Character"
          columns={false}
          hideEmpty={false}
          hideEmptyFields={false}
        >
          <View style={{ gap: 10 }}>
            <Button
              size="small"
              label="Add unspent Stat point"
              onPress={game.character.addUnusedStatPoint}
            />
            <Button
              size="small"
              label="Remove unspent Stat point"
              onPress={game.character.removeUnusedStatPoint}
            />
            <Button
              size="small"
              label="Level up"
              onPress={() => game.character.gainExperienceToReachNextLevel()}
            />
            <Button size="small" label="Level down" onPress={() => game.character.downLevel()} />
          </View>
        </Fieldset>
      </View>
      <View style={style.section}>
        <Fieldset
          legend="Attributes"
          fields={attributes.map(attribute => ({
            label: attribute,
            value: (
              <View style={{ flexDirection: 'row' }}>
                <Text
                  style={{ marginRight: variables.distance / 2, color: variables.colors.white }}
                >
                  {game.character[attribute]}
                </Text>
                <Button
                  size="mini"
                  label="+"
                  wrapperStyle={{ marginRight: variables.distance / 2 }}
                  onPress={() => game.character.changeAttribute(attribute, 1)}
                />
                <Button
                  size="mini"
                  label="-"
                  wrapperStyle={{ marginRight: variables.distance / 2 }}
                  onPress={() => game.character.changeAttribute(attribute, -1)}
                />
              </View>
            )
          }))}
        />
      </View>
      <View style={style.section}>
        <ActorDerivatives actor={game.character} />
      </View>
      <View style={style.section}>
        <Fieldset
          legend="Misc"
          fields={[
            {
              label: 'Health',
              value: (
                <View style={{ flexDirection: 'row' }}>
                  <Text
                    style={{ marginRight: variables.distance / 2, color: variables.colors.white }}
                  >
                    {game.character.health} / {game.character.maxHealth}
                  </Text>
                  <Button
                    size="mini"
                    label="Heal up"
                    disabled={game.character.health === game.character.maxHealth}
                    wrapperStyle={{ marginRight: variables.distance / 2 }}
                    onPress={() => game.character.changeHealth(9999, false)}
                  />
                  <Button
                    size="mini"
                    label="Hurt"
                    wrapperStyle={{ marginRight: variables.distance / 2 }}
                    onPress={() =>
                      game.character.changeHealth(-(game.character.maxHealth / 5), false)
                    }
                  />
                </View>
              )
            },
            {
              label: 'Experience',
              value: (
                <View style={{ flexDirection: 'row' }}>
                  <Text
                    style={{ marginRight: variables.distance / 2, color: variables.colors.white }}
                  >
                    {game.character.experience + ' / ' + game.character.nextLevel}
                  </Text>
                  <Button
                    size="mini"
                    label="Add XP"
                    wrapperStyle={{ marginRight: variables.distance / 2 }}
                    onPress={() =>
                      game.character.gainExperience(
                        Math.round(
                          Math.max((game.character.nextLevel - game.character.experience) / 10, 10)
                        ),
                        false
                      )
                    }
                  />
                </View>
              )
            },
            {
              label: 'Gold',
              value: (
                <View style={{ flexDirection: 'row' }}>
                  <Text
                    style={{ marginRight: variables.distance / 2, color: variables.colors.white }}
                  >
                    {game.character.gold}
                  </Text>
                  <Button
                    size="mini"
                    label="Add gold"
                    wrapperStyle={{ marginRight: variables.distance / 2 }}
                    onPress={() => game.character.changeGold(10, false)}
                  />
                </View>
              )
            },
            {
              label: 'Items',
              value: (
                <View style={{ flexDirection: 'row' }}>
                  <PickUpItemWidget />
                </View>
              )
            }
          ]}
        />
      </View>
      <View style={style.section}>
        <Fieldset
          fields={[]}
          legend="Passives"
          columns={false}
          hideEmpty={false}
          hideEmptyFields={false}
        >
          {game.character.effects.list.map(effect => (
            <Text
              key={effect.uuid}
              style={{
                color: '#FFF',
                textTransform: 'capitalize',
                fontSize: variables.fonts.body - 2
              }}
            >
              {effect.id}
            </Text>
          ))}
        </Fieldset>
      </View>
    </ScrollView>
  )
})

export default Character
