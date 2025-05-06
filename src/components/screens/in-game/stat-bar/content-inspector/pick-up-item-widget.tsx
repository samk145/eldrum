import React, { useState } from 'react'
import { View, SectionList, TouchableOpacity } from 'react-native'
import { useGameStore } from '../../../../../contexts/stores'
import { variables, dimensions } from '../../../../../styles'
import { Inventory } from '../../../../../models/character/inventory'
import { Text, Button, CardModal } from '../../../../units'

const ItemList = () => {
  const { character, getEntities } = useGameStore()

  const items = getEntities('items')

  const itemListData = Inventory.itemGroupNames.map(groupName => {
    return {
      title: groupName.toUpperCase(),
      data: items
        .filter(item => Inventory.getItemGroup(item) === groupName)
        .sort((a, b) => {
          const textA = a.name.toUpperCase()
          const textB = b.name.toUpperCase()
          return textA < textB ? -1 : textA > textB ? 1 : 0
        })
    }
  })

  return (
    <View style={{ height: dimensions.height - variables.distance * 8 }}>
      <SectionList
        sections={itemListData}
        keyExtractor={(item, index) => item._id}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: variables.distance,
              paddingVertical: variables.distance / 4,
              borderBottomWidth: 1,
              borderBottomColor: variables.colors.nightLight
            }}
          >
            <Text style={{ color: variables.colors.white, fontSize: variables.fonts.body - 3 }}>
              {item.name}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: 'black',
                width: variables.distance * 1.2,
                height: variables.distance * 1.2,
                borderRadius: variables.distance,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={() => {
                character.inventory.pickUpItem(item._id)
              }}
            >
              <Text
                style={{
                  color: variables.colors.white,
                  fontSize: variables.fonts.body - 3,
                  marginTop: -variables.distance / 12
                }}
              >
                +
              </Text>
            </TouchableOpacity>
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text
            style={{
              color: variables.colors.white,
              fontSize: variables.fonts.body,
              fontFamily: variables.fonts.bold,
              textAlign: 'center',
              marginTop: variables.distance,
              marginBottom: variables.distance
            }}
          >
            {title}
          </Text>
        )}
      />
    </View>
  )
}

const PickUpItemWidget = () => {
  const [visible, setVisible] = useState(false)
  const openModal = () => setVisible(true)
  const closeModal = () => setVisible(false)

  return (
    <>
      <Button
        size="mini"
        label="Pick up item"
        wrapperStyle={{ marginRight: variables.distance / 2 }}
        onPress={openModal}
      />
      <CardModal
        visible={visible}
        useOverlay
        useHandler={true}
        onHandleDragSuccess={closeModal}
        onOverlayPress={closeModal}
      >
        <ItemList />
      </CardModal>
    </>
  )
}

export default PickUpItemWidget
