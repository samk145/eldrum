import React, { useState } from 'react'
import { Switch, View, ScrollView, TouchableOpacity } from 'react-native'
import { observer } from 'mobx-react'
import { useGameStore } from '../../../../../contexts/stores'
import { Text, Fieldset, CardModal, Button } from '../../../../units'
import * as styles from './tools.style'
import generalStyle from './style'

import type ContentTest from '../../../../../models/inspector/content-test/content-test'

interface IContentTesterManagerProps {
  onTestStart?: () => void
}

type TTestProps = {
  test: ContentTest
}

const Test = observer(({ test }: TTestProps) => {
  return (
    <View style={styles.test.wrapper}>
      <Text style={styles.test.name}>{test.name}</Text>
      {test.tasks.map(task => (
        <View style={styles.task.wrapper} key={task._id}>
          <Text
            style={[
              styles.task.name,
              !task.active && styles.task.nameInactive,
              task.completed && styles.task.nameCompleted
            ]}
          >
            {task.name}
          </Text>
          <View style={styles.steps.wrapper}>
            {task.steps.map(step => (
              <TouchableOpacity
                key={step._id}
                onPress={step.completed ? step.markAsIncomplete : step.markAsComplete}
                style={[
                  styles.steps.step,
                  step === task.currentStep && styles.steps.stepCurrent,
                  step.completed && styles.steps.stepCompleted
                ]}
              ></TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  )
})

const Tools: React.FC<IContentTesterManagerProps> = observer(
  ({ onTestStart = () => undefined }) => {
    const game = useGameStore()
    const [modalIsOpen, setOpenModal] = useState<boolean>(false)
    const closeModal = () => setOpenModal(false)
    const openModal = () => setOpenModal(true)

    return (
      <ScrollView style={generalStyle.scrollWrapper}>
        <View style={generalStyle.section}>
          <Fieldset
            legend="Bot settings"
            columns
            fields={[
              {
                label: 'Ignore lethal options',
                value: (
                  <Switch
                    style={{ transform: [{ scale: 0.7 }] }}
                    onValueChange={() => {
                      game.inspector?.bot.toggleIgnoreLethalOption()
                    }}
                    value={game.inspector?.bot.ignoreLethalOptions}
                  />
                )
              },
              {
                label: 'Prompt before combat',
                value: (
                  <Switch
                    style={{ transform: [{ scale: 0.7 }] }}
                    onValueChange={() => {
                      game.inspector?.bot.togglePromptBeforeCombat()
                    }}
                    value={game.inspector?.bot.promptBeforeCombat}
                  />
                )
              },
              {
                label: 'Auto-close bargain',
                value: (
                  <Switch
                    style={{ transform: [{ scale: 0.7 }] }}
                    onValueChange={() => {
                      game.inspector?.bot.toggleAutoCloseBargain()
                    }}
                    value={game.inspector?.bot.autoCloseBargain}
                  />
                )
              },
              {
                label: 'Auto-equip items',
                value: (
                  <Switch
                    style={{ transform: [{ scale: 0.7 }] }}
                    onValueChange={() => {
                      game.inspector?.bot.toggleAutoEquipItems()
                    }}
                    value={game.inspector?.bot.autoEquipItems}
                  />
                )
              }
            ]}
          />
        </View>
        <View style={generalStyle.section}>
          <Fieldset
            legend="Automation & testing"
            columns
            fields={[
              {
                label: 'Bot',
                value: (
                  <Button
                    size="mini"
                    label="Start"
                    onPress={() => {
                      if (game) {
                        game.inspector?.bot.start()
                        onTestStart()
                      }
                    }}
                  />
                )
              },
              {
                label: 'Test',
                value: (
                  <Button
                    size="mini"
                    label={game.inspector?.test ? 'Change test' : 'Select test'}
                    onPress={openModal}
                  />
                )
              }
            ]}
          />
          {game.inspector?.test && <Test test={game?.inspector?.test} />}
        </View>

        <CardModal
          visible={modalIsOpen}
          useHandler={true}
          onHandleDragSuccess={closeModal}
          onOverlayPress={closeModal}
          useOverlay
        >
          <View style={styles.tests.wrapper}>
            <Text style={styles.tests.headline}>Tests</Text>
            {game?.getEntities('tests').map(editorTest => (
              <Button
                wrapperStyle={{ marginBottom: 10 }}
                key={editorTest._id}
                label={editorTest.name}
                onPress={() => {
                  closeModal()
                  game.inspector?.selectTest(editorTest._id)
                }}
              />
            ))}
            <Button
              wrapperStyle={{ marginBottom: 10 }}
              label="No test"
              onPress={() => {
                closeModal()
                game.inspector?.selectTest()
              }}
            />
          </View>
        </CardModal>
      </ScrollView>
    )
  }
)

export default Tools
