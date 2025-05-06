import { observer } from 'mobx-react'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet } from 'react-native'
import { AccessibilityFocus, CardModal, Icon, Text, Button } from '../../../units'
import { useGameStore } from '../../../../contexts'
import { useDimensions } from '../../../../hooks/dimensions'
import { variables, styles, size, helpers } from '../../../../styles'

const { distance, colors, fonts } = variables

function getIconSize(deviceSize: string) {
  switch (deviceSize) {
    case 'xsmall':
      return 45
    case 'small':
      return 60
    case 'medium':
      return 85
    default:
      return 120
  }
}

const iconSize = getIconSize(size)

export const OverEncumbered = observer(function OverEncumbered() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const game = useGameStore()
  const dimensions = useDimensions()

  const close = useCallback(() => {
    setVisible(false)
  }, [])

  useEffect(() => {
    if (game.character.overEncumbered) {
      setVisible(true)
    }
  }, [game.character.overEncumbered])

  return (
    <CardModal
      useOverlay
      overlayOpacity={0.3}
      visible={visible}
      onHandleDragSuccess={close}
      onOverlayPress={close}
    >
      <View style={[style.wrapper, { marginBottom: dimensions.insets.bottom }]}>
        <View style={style.iconWrapper}>
          <Icon
            name="warning"
            height={iconSize}
            width={iconSize}
            fill={variables.colors.turmeric}
          />
        </View>
        <AccessibilityFocus id="overEncumbranceWarning" focusOnUpdate={false}>
          <Text style={style.title}>{t('CHARACTER-OVER_ENCUMBERED_WARNING-TITLE')}</Text>
          <Text style={style.description}>{t('CHARACTER-OVER_ENCUMBERED_WARNING-DESC')}</Text>
        </AccessibilityFocus>
        <Button
          style={style.button}
          onPress={close}
          label={t('CHARACTER-OVER_ENCUMBERED_WARNING-BUTTON-LABEL')}
        />
      </View>
    </CardModal>
  )
})

const style = StyleSheet.create({
  wrapper: {
    paddingHorizontal: distance * 2,
    paddingTop: distance / 2,
    paddingBottom: distance * 2,
    alignItems: 'center'
  },
  infoWrapper: {
    alignItems: 'center'
  },
  iconWrapper: {
    marginBottom: distance
  },
  title: {
    textTransform: 'uppercase',
    textAlign: 'center',
    ...styles.headline
  },
  description: {
    marginTop: distance / 2,
    color: colors.white,
    textAlign: 'center',
    ...helpers.FontSizeAndLineHeight(fonts.body - 2)
  },
  button: {
    width: '100%',
    marginTop: distance
  }
})
