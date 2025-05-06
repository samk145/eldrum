import React, { useState } from 'react'
import { View, TextInput, StyleSheet } from 'react-native'
import { CardModal, Button, Text } from '../../../units'
import { variables, dimensions } from '../../../../styles'

type TUrlLoadModalProps = {
  visible: boolean
  onClose: () => void
  onSubmit: (url: string) => void
}

const { colors, distance, fonts } = variables

const UrlLoadModal = ({ visible, onClose, onSubmit }: TUrlLoadModalProps) => {
  const [inputUrl, setInputUrl] = useState('')

  const handleLoadUrl = () => {
    if (inputUrl) {
      onSubmit(inputUrl)
    }
    onClose()
  }

  const handleCancelUrl = () => {
    onClose()
  }

  return (
    <CardModal
      visible={visible}
      useHandler={false}
      onOverlayPress={handleCancelUrl}
      useOverlay={true}
      overlayOpacity={0.75}
      offset={{
        bottom: dimensions.height * 0.42
      }}
      cardProps={{
        corners: 'all',
        style: { width: '95%', maxWidth: 450 }
      }}
    >
      <View style={styles.wrapper}>
        <Text style={styles.title}>{'Load from URL'}</Text>
        <Text style={styles.description}>{'Enter the URL of the save file'}</Text>

        <TextInput
          style={styles.input}
          onChangeText={setInputUrl}
          value={inputUrl}
          placeholder="https://"
          placeholderTextColor={colors.faded}
          autoFocus
          selectionColor={colors.turmeric}
        />

        <View style={styles.buttonsContainer}>
          <View style={styles.buttonWrapper}>
            <Button
              size="regular"
              label={'Cancel'}
              onPress={handleCancelUrl}
              wrapperStyle={{ width: '100%' }}
            />
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              size="regular"
              label={'OK'}
              onPress={handleLoadUrl}
              tint={colors.turmeric}
              wrapperStyle={{ width: '100%' }}
            />
          </View>
        </View>
      </View>
    </CardModal>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    padding: distance,
    width: '100%'
  },
  title: {
    textAlign: 'center',
    marginBottom: distance,
    fontSize: fonts.body,
    fontWeight: 'bold',
    color: colors.white
  },
  description: {
    textAlign: 'center',
    marginBottom: distance,
    color: colors.white
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.nightShade,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.white,
    marginBottom: distance,
    fontFamily: fonts.default,
    fontSize: fonts.body,
    color: colors.night
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: distance / 2
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: distance / 4
  }
})

export default UrlLoadModal
