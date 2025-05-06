import React from 'react'
import { ScrollView, Linking, View, type ColorValue } from 'react-native'
// @ts-expect-error: Missing type definitions for 'react-native-markdown-view'
import { MarkdownView } from 'react-native-markdown-view'
import { LinearGradient } from 'expo-linear-gradient'
import { helpers, variables } from '../../../styles'
import { useDimensions } from '../../../hooks/dimensions'
import { useScreenReaderInfo } from '../../../hooks/accessibility'
import { Button } from '../../units/button/button'
import { CardModal } from '../../units/card-modal/card-modal'
import { style, MarkdownStyles } from './reader.style'
import { useTranslation } from 'react-i18next'

const handleLinkPress = async (url: string) => {
  try {
    await Linking.openURL(url)
  } catch (error) {}
}

type TReaderProps = {
  backgroundColor?: string
  buttonAction: () => void
  topOffset?: number
  buttonBackground?: ColorValue
  buttonLabel?: string
  buttonTextColor?: ColorValue
  content: React.ReactNode
  visible: boolean
  textColor?: string
}

export const Reader = ({
  backgroundColor = variables.colors.night,
  buttonAction,
  buttonBackground,
  buttonLabel,
  buttonTextColor,
  content,
  visible,
  textColor = variables.colors.white,
  topOffset = variables.distance * 5
}: TReaderProps) => {
  const { t } = useTranslation()
  const { maxHeight } = useDimensions()
  const markdownStyles = MarkdownStyles(textColor)
  const transparentBackgroundColor = helpers.hexToRgbA(backgroundColor, 0)
  const isScreenReaderEnabled = useScreenReaderInfo()

  const bottomGradientColors = [
    transparentBackgroundColor,
    backgroundColor,
    backgroundColor,
    backgroundColor,
    backgroundColor
  ]

  return (
    <CardModal
      useHandler={isScreenReaderEnabled}
      onHandleDragSuccess={buttonAction}
      visible={visible}
      useOverlay
      overlayOpacity={0.4}
      cardProps={{ style: { width: '100%' }, tint: backgroundColor }}
    >
      <View
        style={[
          style.wrapper,
          {
            height: maxHeight - topOffset
          }
        ]}
      >
        <LinearGradient
          colors={[backgroundColor, transparentBackgroundColor]}
          style={style.topGradient}
        />
        <ScrollView style={style.textWrapper}>
          <MarkdownView
            onLinkPress={handleLinkPress}
            style={style.markdownWrapper}
            styles={markdownStyles}
          >
            {typeof content === 'string' ? content : ''}
          </MarkdownView>
        </ScrollView>
        <LinearGradient colors={bottomGradientColors} style={style.buttonWrapper}>
          <Button
            tint={buttonBackground}
            labelStyle={(buttonTextColor && { color: buttonTextColor }) || {}}
            label={buttonLabel || t('CLOSE-LABEL')}
            onPress={buttonAction}
          />
        </LinearGradient>
      </View>
    </CardModal>
  )
}
