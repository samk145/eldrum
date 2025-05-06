import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react'
import { View, TouchableOpacity, BackHandler, type NativeEventSubscription } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useDimensions } from '../../../hooks/dimensions'
import { variables } from '../../../styles'
import { useGameStore } from '../../../contexts/stores'
import { useScreenReaderInfo } from '../../../hooks/accessibility'
import { CardModal, EModalType } from '../../units/card-modal/card-modal'
import Notifier from '../notifier/notifier'
import { Text } from '../../units/text/text'
import { Highlighter } from '../../units/highlighter/highlighter'
import { NotifierToggler } from './notifier-toggler/notifier-toggler'
import style from './stack.style'

export type TStackCardProps = {
  label: string
  render: React.ReactNode
  onOpen?: () => void
  onClose?: () => void
  notification?: () => boolean
}

export type TStackInstance = {
  open: (index?: number) => void
  close: () => void
}

export type TStackProps = {
  onOpen?: () => void
  onClose?: () => void
  index?: number
  cards: TStackCardProps[]
  tint?: string
  locked?: boolean
}

type TStackState = {
  previousCard: number | null
  currentCard: number | null
  notifierBackgroundHeight: number
}

export const Stack = forwardRef<TStackInstance, TStackProps>(function Stack(
  { onOpen, onClose, index, cards, tint, locked }: TStackProps,
  ref
) {
  const game = useGameStore()
  const isScreenReaderEnabled = useScreenReaderInfo()
  const { insets, maxHeight } = useDimensions()
  const [state, setState] = useState<TStackState>({
    previousCard: null,
    currentCard: index ?? null,
    notifierBackgroundHeight: 0
  })
  const androidBackHandler = useRef<NativeEventSubscription>()
  const cardModalOpen = state.currentCard !== null
  const { notifierBackgroundHeight } = state
  const deviceBottomOffset = insets.bottom
  const height = Math.min(maxHeight - variables.distance * 5, 900)
  const cardModalOffset = { left: 0, right: 0, bottom: style.tabs.height + deviceBottomOffset }
  const androidViewStyle = [{ height: notifierBackgroundHeight }, style.notificationAndroidBg]
  useImperativeHandle(ref, () => {
    return {
      open: (index?: number) => handleTabPress(index),
      close: () => handleTabPress()
    }
  }, [])

  const onNotifierHeightChange = (height: number) =>
    setState({ ...state, notifierBackgroundHeight: height })

  const handleTabPress = (newCardIndex?: number) => {
    setState(state => {
      const previousCardIndex: TStackState['previousCard'] = state.currentCard
      const newState: TStackState = {
        ...state,
        previousCard: state.currentCard,
        currentCard:
          state.currentCard === newCardIndex || newCardIndex === undefined ? null : newCardIndex
      }

      if (newCardIndex !== undefined) {
        const newCard = cards[newCardIndex]

        if (newCard?.onOpen) {
          newCard.onOpen()
        }
      }

      const previousCard = previousCardIndex !== null && cards[previousCardIndex]

      if (previousCard && previousCard.onClose) {
        previousCard.onClose()
      }

      return newState
    })
  }

  const close = () => {
    handleTabPress()
  }

  const open = (index: number) => {
    handleTabPress(index)
  }

  useEffect(() => {
    if (index !== undefined && !isNaN(index) && index !== state.currentCard) {
      handleTabPress(index)
    }
  }, [index])

  useEffect(() => {
    if (cardModalOpen) {
      androidBackHandler.current = BackHandler.addEventListener('hardwareBackPress', () => {
        close()
        return true
      })
    } else {
      if (androidBackHandler.current) {
        androidBackHandler.current.remove()
      }
    }

    if (!cardModalOpen && state.previousCard !== null && onClose) {
      onClose()
    }

    if (cardModalOpen && !state.previousCard !== null && onOpen) {
      onOpen()
    }

    return () => {
      if (androidBackHandler.current) {
        androidBackHandler.current.remove()
      }
    }
  }, [cardModalOpen])

  return (
    <React.Fragment>
      <CardModal
        mode={EModalType.JS}
        offset={cardModalOffset}
        useOverlay
        overlayOpacity={0.3}
        onOverlayPress={close}
        onHandleDragSuccess={close}
        cardProps={{ style: { height }, tint, corners: 'top' }}
        visible={cardModalOpen}
        height={height}
        useHandler={true}
      >
        {cardModalOpen &&
          state.currentCard !== null &&
          cards[state.currentCard] &&
          cards[state.currentCard].render}
      </CardModal>

      {game.notifications.visible && (
        <TouchableOpacity onPress={game.notifications.close} style={androidViewStyle} />
      )}

      <View style={style.bottom}>
        <View
          accessibilityRole="tablist"
          style={[
            style.tabs,
            { height: style.tabs.height + deviceBottomOffset, paddingBottom: deviceBottomOffset },
            tint ? { backgroundColor: tint } : undefined
          ]}
        >
          {cards.map((card, index) => (
            <Tab
              key={index}
              card={card}
              disabled={locked}
              isOpen={state.currentCard === index}
              onPress={() => open(index)}
            />
          ))}

          {isScreenReaderEnabled && <NotifierToggler game={game} />}
        </View>

        {!isScreenReaderEnabled && <Notifier onHeightChange={onNotifierHeightChange} />}
      </View>
    </React.Fragment>
  )
})

const Tab = ({
  card,
  isOpen,
  onPress,
  disabled
}: {
  card: TStackCardProps
  isOpen: boolean
  onPress?: () => void
  disabled?: boolean
}) => {
  const { t } = useTranslation()
  const hasNotification = !!(card.notification && card.notification())

  const accessibilityLabel = (() => {
    if (isOpen) {
      return t('STACK-TAB-CLOSE-A11Y_LABEL', { tabName: card.label })
    } else {
      return hasNotification
        ? t('STACK-TAB-OPEN_WITH_UPDATES-A11Y_LABEL', { tabName: card.label })
        : t('STACK-TAB-OPEN-A11Y_LABEL', { tabName: card.label })
    }
  })()

  return (
    <Highlighter
      highlight={hasNotification}
      position="top-center"
      size={style.notification.width}
      wrapperStyle={style.highlighter}
      color={disabled ? variables.colors.nightLight : variables.colors.azure}
    >
      <TouchableOpacity
        disabled={disabled}
        accessibilityRole="tab"
        accessibilityLabel={accessibilityLabel}
        touchSoundDisabled={true}
        activeOpacity={0.5}
        style={[style.tabWrapper, isOpen && style.tabWrapperActive, disabled && style.tabDisabled]}
        onPress={onPress}
      >
        <Text style={[style.tab, isOpen && style.tabActive]}>{card.label}</Text>
      </TouchableOpacity>
    </Highlighter>
  )
}
