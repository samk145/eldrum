import React, { useRef, memo, useEffect, useState } from 'react'
import {
  Animated,
  View,
  PanResponder,
  Pressable,
  Platform,
  Modal,
  type Insets,
  type GestureResponderEvent
} from 'react-native'
import { Portal } from '@gorhom/portal'
import { useDimensions } from '../../../hooks/dimensions'
import { dimensions, variables } from '../../../styles'
import { useScreenReaderInfo } from '../../../hooks/accessibility'
import { Card, type TCardProps } from '../card/card'
import style from './card-modal.style'
import { useTranslation } from 'react-i18next'

const OUTPOSITION = dimensions.height
const BOTTOM_OFFSET_ANIM_COUNTER = 25 // Used to counter the spring animation from exposing the bottom end of the card

export enum EModalType {
  JS = 'js-modal',
  RN = 'rn-modal'
}

const usePrevious = (value: boolean) => {
  const ref = useRef<boolean>()

  useEffect(() => {
    ref.current = value
  })

  return ref.current
}

export interface ICardModalProps {
  mode?: EModalType
  visible?: boolean
  useHandler?: boolean
  onHandleDragSuccess?: () => void
  handleDragSuccessThreshold?: number
  afterClose?: () => void
  cardProps?: TCardProps
  index?: number
  height?: number
  useOverlay?: boolean
  overlayOpacity?: number
  overlayColor?: string
  onOverlayPress?: (event: GestureResponderEvent) => void
  offset?: {
    right?: number
    bottom?: number
    left?: number
  }
  handlerInsets?: Insets
  children: React.ReactNode
}

export const CardModal = memo(function CardModal({
  mode = EModalType.RN,
  visible = false,
  useHandler = true,
  onHandleDragSuccess = () => undefined,
  handleDragSuccessThreshold = 70,
  afterClose = () => undefined,
  cardProps = {},
  index = 0,
  height,
  useOverlay = false,
  overlayOpacity = 0.75,
  overlayColor = variables.colors.black,
  onOverlayPress,
  handlerInsets,
  children,
  offset = {
    right: 0,
    bottom: 0,
    left: 0
  }
}: ICardModalProps) {
  const { t } = useTranslation()
  const zIndex = index + 2
  const [translateY] = useState(new Animated.Value(OUTPOSITION))
  const [modalIsVisible, setModalIsVisible] = useState(false)
  const previousVisibility = usePrevious(visible)
  const { insets } = useDimensions()
  const screenReaderEnabled = useScreenReaderInfo()

  useEffect(() => {
    if (visible && visible !== previousVisibility) {
      animateCardIn()
    } else if (!visible && visible !== previousVisibility && previousVisibility !== undefined) {
      animateCardOut()
    }
  }, [visible])

  const animateCardIn = () => {
    setModalIsVisible(true)

    Animated.spring(translateY, {
      toValue: BOTTOM_OFFSET_ANIM_COUNTER,
      friction: 9,
      tension: 60,
      useNativeDriver: true
    }).start()
  }

  const animateCardOut = () => {
    Animated.timing(translateY, {
      toValue: OUTPOSITION,
      duration: 250,
      useNativeDriver: true
    }).start(() => {
      setModalIsVisible(false)

      if (afterClose && !visible) {
        afterClose()
      }
    })
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState
        return dx > 2 || dx < -2 || dy > 2 || dy < -2
      },

      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        const { dx, dy } = gestureState
        return dx > 2 || dx < -2 || dy > 2 || dy < -2
      },
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy)
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > handleDragSuccessThreshold) {
          onHandleDragSuccess()
        } else {
          animateCardIn()
        }
      }
    })
  ).current

  const onAccessibilityEscape = useHandler ? () => onHandleDragSuccess() : undefined

  const toOpacityInterpolateOptions = {
    inputRange: [0, OUTPOSITION],
    outputRange: [overlayOpacity, 0]
  }

  const { style: cardStyle, ...restCardProps } = cardProps

  const cardViewStyle = [
    style.cardStyle,
    cardStyle,
    useHandler ? style.cardWithCloser : {},
    {
      // Add safe area insets to the bottom of the card unless it's offset
      // by the same or greater amount (in which case the inset is not)
      paddingBottom:
        offset.bottom && offset.bottom < insets.bottom
          ? Math.max(insets.bottom, 0) + BOTTOM_OFFSET_ANIM_COUNTER
          : BOTTOM_OFFSET_ANIM_COUNTER
    }
  ]

  const content = (
    <Animated.View
      pointerEvents="box-none"
      style={[style.wrapper, offset, { height, transform: [{ translateY }], zIndex }]}
      onAccessibilityEscape={onAccessibilityEscape}
    >
      <Card style={cardViewStyle} {...restCardProps}>
        {(visible || modalIsVisible) && children}
      </Card>

      {visible && useHandler && screenReaderEnabled && (
        <View style={style.getCardCloser(handlerInsets)}>
          <Pressable
            accessible
            accessibilityLabel={t('CLOSE-LABEL')}
            accessibilityRole="button"
            style={style.cardCloserIndicator}
            onPress={onAccessibilityEscape}
          />
        </View>
      )}

      {visible && useHandler && !screenReaderEnabled && (
        <View style={style.getCardCloser(handlerInsets)} {...panResponder.panHandlers}>
          <View style={style.cardCloserIndicator} />
        </View>
      )}
    </Animated.View>
  )

  /** This is a hack that's needed for two reasons:
   *
   * 1. Without it, scrolling is not possible on Android within the modal
   * 2. When screen reader is enabled, it's not possible to swipe-navigate to other items if
   *    you've manually selected something in the card's content.
   **/
  const coverView = (
    <View
      accessible={false}
      style={{ height: visible && height ? height : 0, zIndex: zIndex - 1 }}
    />
  )

  const overlay = useOverlay ? (
    <Animated.View
      pointerEvents={visible || modalIsVisible ? 'auto' : 'none'}
      style={[
        style.overlay,
        {
          top:
            mode === 'js-modal' && (visible || modalIsVisible)
              ? -(dimensions.height - (offset.bottom ? offset.bottom : 0))
              : 0,
          zIndex: zIndex - 2,
          backgroundColor: overlayColor,
          flex: modalIsVisible ? 1 : 0,
          opacity: translateY.interpolate(toOpacityInterpolateOptions)
        }
      ]}
    >
      {!screenReaderEnabled && (
        <Pressable style={style.overlayPressable} onPress={onOverlayPress} />
      )}
    </Animated.View>
  ) : null

  // If we're in RN mode, and screen reader is enabled, we need to use a native modal
  // because otherwise TalkBack will select elements that are underneath the modal
  if (mode === EModalType.RN && screenReaderEnabled && Platform.OS === 'android') {
    return (
      <Modal transparent visible={visible || modalIsVisible}>
        {overlay}
        {coverView}
        {content}
      </Modal>
    )
  }

  return mode === EModalType.JS ? (
    <React.Fragment>
      {overlay}
      {coverView}
      {content}
    </React.Fragment>
  ) : (
    <Portal>
      {(visible || modalIsVisible) && (
        <View
          accessibilityViewIsModal
          importantForAccessibility="yes"
          pointerEvents="box-none"
          style={style.portalWrapper}
        >
          {overlay}
          {coverView}
          {content}
        </View>
      )}
    </Portal>
  )
})
