import React, { memo } from 'react'
import { type StyleProp, type TextStyle, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { CardModal, type ICardModalProps } from '../card-modal/card-modal'
import { Text } from '../text/text'
import { Button } from '../button/button'
import style from './alert-card-modal.style'
import { LoadingIndicator } from '../loading-indicator/loading-indicator'

export interface IAlertSuccessData {
  isSuccessful: boolean
  title?: string
  text?: string
  buttons?: IAlertButton[]
}
export interface IAlertButton {
  text: string
  onPress: () => void
  tintColor?: string
}

const renderButtons = (button: IAlertButton) => (
  <Button
    key={button.text}
    labelStyle={style.buttonLabel}
    wrapperStyle={style.buttonWrapper}
    label={button.text}
    onPress={button.onPress}
    tint={button.tintColor}
  />
)

export interface IAlertCardModalProps extends Partial<ICardModalProps> {
  visible: boolean
  onDismiss: () => void
  loading?: boolean
  successData?: IAlertSuccessData
  title?: string
  text?: string
  buttons?: IAlertButton[]
  additionalTitleStyles?: StyleProp<TextStyle>
}

/**
 *
 * @param children Use only modal children, so they can be nested inside the component
 * @param loading You can use the loading prop for both loading into default or successful state
 * @returns
 */
export const AlertCardModal = memo(function AlertCardModal({
  visible = false,
  onDismiss,
  loading,
  successData,
  title,
  additionalTitleStyles,
  text,
  buttons: buttonsProp,
  mode,
  useOverlay = true,
  onOverlayPress,
  onHandleDragSuccess,
  overlayOpacity = 0.6,
  handlerInsets = { bottom: 40 },
  children
}: IAlertCardModalProps) {
  const { t } = useTranslation()
  const defaultButtons = [{ text: t('ALERT_CARD_MODAL-BUTTON-LABEL'), onPress: () => onDismiss() }]
  const buttons = buttonsProp || defaultButtons
  const successButtons = successData?.buttons || defaultButtons

  return (
    <CardModal
      visible={visible}
      mode={mode}
      useOverlay={useOverlay}
      onOverlayPress={onOverlayPress || onDismiss}
      onHandleDragSuccess={onHandleDragSuccess || onDismiss}
      overlayOpacity={overlayOpacity}
      handlerInsets={handlerInsets}
    >
      <View style={style.wrapper}>
        {loading ? (
          <LoadingIndicator size={150} />
        ) : successData?.isSuccessful ? (
          <>
            {
              <View style={style.titleWrapper}>
                <Text style={[style.titleText, style.successTitleText]}>
                  {successData.title || t('ALERT_CARD_MODAL-TITLE')}
                </Text>
              </View>
            }
            {
              <View style={style.textWrapper}>
                <Text style={style.text}>{successData?.text || t('ALERT_CARD_MODAL-MESSAGE')}</Text>
              </View>
            }
            {successButtons.map(renderButtons)}
          </>
        ) : (
          <>
            {!!title && (
              <View style={style.titleWrapper}>
                <Text style={[style.titleText, additionalTitleStyles]}>{title}</Text>
              </View>
            )}
            {!!text && (
              <View style={style.textWrapper}>
                <Text style={style.text}>{text}</Text>
              </View>
            )}
            {children}
            {buttons.map(renderButtons)}
          </>
        )}
      </View>
    </CardModal>
  )
})
