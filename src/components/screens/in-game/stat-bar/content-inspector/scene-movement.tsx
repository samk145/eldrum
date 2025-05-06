import type { EditorLocation, EditorArea } from '@actnone/eldrum-editor/dist/types'

import React, { useState } from 'react'
import { View, ScrollView, SectionList, TouchableOpacity } from 'react-native'
import { observer } from 'mobx-react'
import { useTranslation } from 'react-i18next'
import { useGameStore, useStores, useConfig } from '../../../../../contexts/stores'
import { variables, dimensions } from '../../../../../styles'
import { Text, ProgressBar, Fieldset, CardModal, Button } from '../../../../units'
import fieldsetStyle from '../../../../units/fieldset/fieldset.style'
import ActorDerivatives from './actor-derivatives'
import style from './style'

const truncate = (string: string, length: number = 25) =>
  string.length > length ? string.substring(length, 0).trim() + '...' : string

const LocationList = ({ onChangeLocationPress }: { onChangeLocationPress: () => void }) => {
  const { movement, getEntities, puppeteer } = useGameStore()

  const locations: EditorLocation[] = getEntities('locations')
  const areas: EditorArea[] = getEntities('areas')

  const locationListData = areas.map(area => {
    return {
      title: area.name,
      data: locations.filter(location => location.area === area._id)
    }
  })

  return (
    <View style={{ height: dimensions.height - variables.distance * 8 }}>
      <SectionList
        sections={locationListData}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <Button
            size="small"
            wrapperStyle={{ margin: variables.distance / 2, marginTop: 0 }}
            label={item.name}
            onPress={() => {
              onChangeLocationPress()
              puppeteer.closeModal()
              movement.goToLocation(item._id)
            }}
          />
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

const Movement = observer(() => {
  const { movement } = useGameStore()
  const [modalIsOpen, setOpenModal] = useState<boolean>(false)
  const closeModal = () => setOpenModal(false)

  return (
    <React.Fragment>
      <Fieldset
        legend="Movement"
        hideEmpty={false}
        hideEmptyFields={false}
        fields={[
          {
            label: 'Area',
            value: movement.area.name
          },
          {
            label: 'Location',
            value: movement.location.name
          },
          {
            label: 'Pending location',
            value: movement.pendingLocation ? movement.pendingLocation.name : '–'
          }
        ]}
      />
      <Button
        size="small"
        wrapperStyle={{ marginTop: variables.distance }}
        label="Teleport to different location"
        onPress={() => setOpenModal(true)}
      />
      <CardModal
        visible={modalIsOpen}
        useOverlay
        useHandler={true}
        onHandleDragSuccess={closeModal}
        onOverlayPress={closeModal}
      >
        <LocationList onChangeLocationPress={closeModal} />
      </CardModal>
    </React.Fragment>
  )
})

const Scene = () => {
  const { scene, actors } = useGameStore()
  const [selectedNpcId, setOpenModal] = useState<string | null>(null)
  const closeModal = () => setOpenModal(null)
  const openModal = (npcId: string) => setOpenModal(npcId)
  const selectedNpc = selectedNpcId ? actors.getNpc(selectedNpcId) : undefined

  return (
    <>
      <Fieldset
        legend="Scene"
        columns={false}
        hideEmpty={false}
        hideEmptyFields={false}
        fields={[
          {
            label: 'Type',
            value: scene.type
          },
          {
            label: 'Name',
            value: scene.scene.name
          },
          {
            label: 'Current node',
            value: truncate(scene.node.narrative[0], 75)
          },
          {
            label: 'Underlying scene',
            value: scene.underlyingScene?.name || 'N/A'
          },
          {
            label: 'NPCs',
            value: (
              <View>
                {actors.npcs.map(npc => (
                  <TouchableOpacity
                    onPress={() => openModal(npc._id)}
                    key={npc._id}
                    style={style.npcWrapper}
                  >
                    <View style={style.npcHealthBar}>
                      <ProgressBar
                        color={[variables.colors.lowHealth, variables.colors.highHealth]}
                        borderRadius={5}
                        value={npc.health}
                        maxValue={npc.maxHealth}
                        height={10}
                      />
                    </View>
                    <Text style={[fieldsetStyle.value]}>{npc._alias ? npc._alias : npc.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )
          }
        ]}
      />
      <CardModal
        visible={!!selectedNpcId}
        useOverlay
        useHandler={true}
        onHandleDragSuccess={closeModal}
        onOverlayPress={closeModal}
      >
        <View style={{ padding: 20, marginBottom: 40 }}>
          {selectedNpc && <ActorDerivatives actor={selectedNpc} />}
          <Button
            wrapperStyle={{ marginTop: 20 }}
            label="Heal"
            onPress={() => selectedNpc?.changeHealth(selectedNpc.maxHealth)}
          />
        </View>
      </CardModal>
    </>
  )
}

const SceneMovement = () => {
  const { i18n } = useTranslation()
  const config = useConfig()
  const { arena } = useGameStore()
  const { play, content } = useStores()
  const [isLoadingTranslations, setLoadingTranslations] = useState<boolean>(false)

  return (
    <ScrollView style={style.scrollWrapper}>
      <View style={style.section}>
        <Scene />
      </View>
      {!!config.editor.baseUrl && (
        <View style={style.section}>
          <Button
            size="small"
            label="Reload content from editor"
            onPress={play.reloadContentFromEditor}
          />
          <Button
            size="small"
            disabled={content.defaultLocale === i18n.language}
            label={
              isLoadingTranslations
                ? 'Loading translations...'
                : `Reload translations from weblate (${i18n.language.toUpperCase()})`
            }
            onPress={async () => {
              setLoadingTranslations(true)
              await content.loadRemoteTranslations([i18n.language])
              setLoadingTranslations(false)
            }}
          />
        </View>
      )}
      <View style={style.section}>
        <Movement />
      </View>
      <View style={style.section}>
        <Fieldset
          wrapperStyle={{ marginBottom: variables.distance }}
          legend="Arena"
          hideEmpty={false}
          hideEmptyFields={false}
          fields={[
            {
              label: 'Current tier',
              value: (
                <View style={{ flexDirection: 'row' }}>
                  <Text
                    style={{ color: variables.colors.white, marginRight: variables.distance / 2 }}
                  >
                    {arena.currentTier}
                  </Text>
                  <Button
                    size="mini"
                    label="+"
                    wrapperStyle={{ marginRight: variables.distance / 2 }}
                    onPress={arena.increaseTier}
                  />
                  <Button
                    size="mini"
                    label="-"
                    wrapperStyle={{ marginRight: variables.distance / 2 }}
                    onPress={arena.decreaseTier}
                  />
                </View>
              )
            }
          ]}
        />
        <Button
          wrapperStyle={{ marginBottom: variables.distance / 2 }}
          size="small"
          label="Reset all challenges"
          onPress={arena.resetChallenges}
        />
        <Button
          size="small"
          label="Reset pristine challenges"
          onPress={arena.resetPristineChallenges}
        />
      </View>
    </ScrollView>
  )
}

export default observer(SceneMovement)
