import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import {
  View,
  Animated,
  type LayoutChangeEvent,
  PanResponder,
  ScrollView,
  Modal
} from 'react-native'
import { observer } from 'mobx-react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useStores, useGameStore } from '../../../../contexts/stores'
import { RoundButton, AccessibilityFocus, Icon } from '../../../units'
import { useTranslation } from 'react-i18next'
import { delay } from '../../../../helpers/misc'
import { Anim } from '../../../../models/marionette'
import Puppeteer from '../../../../models/puppeteer'
import Paragraph from './paragraph'
import style, { customButtonSize } from './ending.style'

type TParagraph = {
  partialId?: string
  text: string
}

const ANIMATION_DELAY =
  Puppeteer.endingBackgroundFadeInDuration +
  Puppeteer.endingBackgroundFadeOutDelay +
  Puppeteer.endingBackgroundFadeOutDuration +
  Puppeteer.endingIntroductionDelay +
  Puppeteer.endingIntroductionDuration
const ANIMATION_DURATION = 750

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView)

const reversed = {
  inputRange: [0, 1],
  outputRange: [1, 0]
}

const Ending = () => {
  const { t } = useTranslation()
  const stores = useStores()
  const game = useGameStore()

  const { ending } = game
  const [seenParagraphsIndex, setSeenParagraphsIndex] = useState<number>(-1)
  const animatedPositionY = useRef(new Animated.Value(0)).current
  const positionY = useRef(0)
  const textContainerHeight = useRef<number>(0)
  const opacity = useRef(new Animated.Value(0)).current
  const backgroundColor = useRef(new Animated.Value(0)).current

  const endingParagraphs: TParagraph[] = useMemo(
    () =>
      ending.partials.length > 0
        ? ending.partials
            .reduce((totalEndingParagraphs: TParagraph[], partial) => {
              const partialParagraphs = [t(`ENDING-${partial._id}-NARRATIVE`, { ns: 'endings' })]
                .join('\n')
                .split('\n')
                .filter(paragraph => paragraph)
                .map(text => ({
                  text,
                  partialId: partial._id
                }))

              totalEndingParagraphs.push(...partialParagraphs)

              return totalEndingParagraphs
            }, [])
            .concat([
              {
                text: `**${t('ENDING-END-TEXT')}**`
              }
            ])
        : [],
    [ending.partials.length]
  )

  const creditsParagraphs: TParagraph[] = t('CREDITS')
    .split('\n\n')
    .filter(content => content)
    .map(text => ({
      text
    }))

  const allParagraphs: TParagraph[] = [...endingParagraphs, ...creditsParagraphs]
  const visibleParagraphs = allParagraphs.filter((_, index) => seenParagraphsIndex >= index)
  const hasReachedCredits =
    endingParagraphs.length > 0 && visibleParagraphs.length >= endingParagraphs.length
  const hasReachedTheEnd = visibleParagraphs.length === allParagraphs.length

  const scrollTo = (y: number) => {
    positionY.current = y

    Animated.spring(animatedPositionY, {
      toValue: y,
      useNativeDriver: true
    }).start()
  }

  const handleLayoutChange = ({ nativeEvent }: LayoutChangeEvent) => {
    const { height } = nativeEvent.layout

    textContainerHeight.current = height
    scrollTo(height)
  }

  const handleNextPress = () => {
    if (textContainerHeight.current === positionY.current) {
      setSeenParagraphsIndex(seenParagraphsIndex => seenParagraphsIndex + 1)
    } else {
      scrollTo(textContainerHeight.current)
    }
  }

  const handleQuitPress = async () => {
    const { puppeteer, sound } = game
    const duration = 3000

    await Promise.all([
      puppeteer.changeMarionetteState('ending', [new Anim('opacity', 0, 'timing', { duration })]),
      sound.pauseAllTracks(duration)
    ])

    stores.play.endGame()
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState
        return dx > 2 || dx < -2 || dy > 2 || dy < -2
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0 || gestureState.dy < 0) {
          const newPosition = positionY.current - gestureState.dy

          animatedPositionY.setValue(newPosition)
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const newPosition = Math.min(
          positionY.current - gestureState.dy,
          textContainerHeight.current
        )

        scrollTo(newPosition)
      }
    })
  ).current

  useEffect(() => {
    const { sound } = game

    const switchToCreditsAudio = async () => {
      await sound.killAllTracks(1000)

      if (ending.creditsAudio) {
        ending.handleAudioChanges([ending.creditsAudio])
      }
    }

    if (hasReachedCredits) {
      const animation = Animated.timing(backgroundColor, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false
      })

      animation.start()

      if (ending.creditsAudio) {
        switchToCreditsAudio()
      }

      return animation.stop
    }
  }, [hasReachedCredits])

  useEffect(() => {
    if (ending.partials.length) {
      const animation = Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        delay: ANIMATION_DELAY,
        useNativeDriver: true
      })

      animation.start()

      const changeTrack = async () => {
        game.sound.killAllTracks(ANIMATION_DELAY + ANIMATION_DURATION)

        if (ending.currentPartialAudio.length > 0) {
          await delay(ANIMATION_DELAY - ANIMATION_DURATION)

          ending.handleAudioChanges(ending.currentPartialAudio)
        }
      }

      changeTrack()

      return animation.stop
    }
  }, [ending.partials.length])

  const onParagraphIdChange = useCallback((id?: string) => {
    if (id) {
      const index = ending.partials.findIndex(partial => partial._id === id)
      ending.setCurrentPartialIndex(index)
    }
  }, [])

  if (!ending.partials.length) return null

  return (
    <AnimatedSafeAreaView
      style={[
        style.wrapper,
        {
          backgroundColor: backgroundColor.interpolate({
            inputRange: [0, 1],
            outputRange: [style.wrapper.backgroundColor, style.wrapperCredits.backgroundColor]
          })
        }
      ]}
    >
      {stores.ui.screenReaderEnabled ? (
        <Modal transparent visible>
          <ScrollView style={style.paragraphsWrapper} contentContainerStyle={style.scrollViewInner}>
            {allParagraphs.map((paragraph, index) => {
              return index === 0 ? (
                <AccessibilityFocus
                  delay={ANIMATION_DELAY}
                  focusOnMount
                  focusOnUpdate
                  id="endingHeadline"
                  key={index}
                >
                  <Paragraph
                    text={paragraph.text}
                    id={paragraph.partialId}
                    onIdChange={onParagraphIdChange}
                  />
                </AccessibilityFocus>
              ) : (
                <Paragraph
                  key={index}
                  text={paragraph.text}
                  id={paragraph.partialId}
                  onIdChange={onParagraphIdChange}
                />
              )
            })}
          </ScrollView>
          <View style={style.buttonWrapper}>
            <RoundButton
              label={t('ENDING-EXIT-BUTTON-LABEL')}
              onPress={handleQuitPress}
              customSize={customButtonSize}
            />
          </View>
        </Modal>
      ) : (
        <>
          <View style={style.paragraphsWrapper} {...panResponder.panHandlers}>
            <Animated.View
              pointerEvents={'none'}
              onLayout={handleLayoutChange}
              style={[
                style.paragraphsWrapperInner,
                { transform: [{ translateY: animatedPositionY.interpolate(reversed) }] }
              ]}
            >
              {visibleParagraphs.map((paragraph, index) => (
                <Paragraph
                  key={index}
                  text={paragraph.text}
                  id={paragraph.partialId}
                  onIdChange={onParagraphIdChange}
                />
              ))}
            </Animated.View>
          </View>
          <Animated.View style={[style.buttonWrapper, { opacity }]}>
            <RoundButton
              icon={hasReachedTheEnd ? undefined : props => <Icon name="rookDagger" {...props} />}
              label={hasReachedTheEnd ? t('ENDING-EXIT-BUTTON-LABEL') : undefined}
              onPress={hasReachedTheEnd ? handleQuitPress : handleNextPress}
              customSize={customButtonSize}
            />
          </Animated.View>
        </>
      )}
    </AnimatedSafeAreaView>
  )
}

export default observer(Ending)
