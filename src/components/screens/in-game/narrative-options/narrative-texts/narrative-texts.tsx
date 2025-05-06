import React, { useEffect, useMemo, useRef } from 'react'
import { observer } from 'mobx-react'
import { View, Animated, PanResponder } from 'react-native'
import { useTranslation } from 'react-i18next'
// @ts-expect-error: Missing type definitions for 'react-native-markdown-view'
import { MarkdownView } from 'react-native-markdown-view'
import { useGameStore } from '../../../../../contexts/stores'
import { useScreenReaderInfo } from '../../../../../hooks'
import { Text } from '../../../../units'
import { size } from '../../../../../styles'
import style from './narrative-texts.style'

type NarrativePosition = {
  from: number
  to: number
}

type TState = {
  from: number
  to: number
  animatedPosition: Animated.Value
}

const DEFAULT_POSITIONS = [
  {
    from: 200,
    to: 0
  },
  {
    from: 0,
    to: -70
  },
  {
    from: -70,
    to: -100
  }
]

const SIZE_MODIFIER = {
  xlarge: 1.5,
  large: 1.5,
  medium: 1,
  small: 1,
  xsmall: 1,
  xxsmall: 1
}

const narrativeBuilder = (narratives: string[][]): string[][] => {
  const length = DEFAULT_POSITIONS.length
  const cutNarratives = narratives.slice(-length).reverse()
  const holder = new Array(length)
  holder.fill([])
  holder.splice(0, cutNarratives.length, ...cutNarratives)

  return holder
}

const scaleInterpolation = function () {
  return {
    inputRange: interpolationInputRangeSteps(),
    // The length of this array must be equal to the amount of unique numbers in DEFAULT_POSITIONS
    outputRange: [0.2, 0.6, 1, 1]
  }
}

const opacityInterpolation = function () {
  return {
    inputRange: interpolationInputRangeSteps(),
    // The length of this array must be equal to the amount of unique numbers in DEFAULT_POSITIONS
    outputRange: [0.1, 0.15, 1, 0]
  }
}

const positions = function (): NarrativePosition[] {
  return DEFAULT_POSITIONS.map(position => ({
    from: position.from * SIZE_MODIFIER[size],
    to: position.to * SIZE_MODIFIER[size]
  }))
}

const interpolationInputRangeSteps = function () {
  const steps = positions()
    .reduce((list: number[], position) => {
      for (const key in position) {
        if (!list.includes(position[key])) {
          list.push(position[key])
        }
      }

      return list
    }, [])
    .reverse()

  return steps
}

export const NarrativeTexts = observer(function NarrativeText() {
  const { t } = useTranslation()
  const game = useGameStore()
  const screenReaderEnabled = useScreenReaderInfo()
  const localNarrative = narrativeBuilder(
    game.scene.history.map(history => history.narrativeTranslationKeys)
  )

  useEffect(() => {
    localNarrative.forEach((_, index) => {
      const state = states[index]
      state.animatedPosition.setValue(state.from)

      animateNarrative(state, () => {
        if (index === 0 && !game.puppeteer.unseenBackground) {
          game._ui.setAccessibilityFocus('NarrativeText', 0)
        }
      })
    })
  }, [localNarrative[0], localNarrative[1], localNarrative[2]])

  const states = useRef<TState[]>(
    positions().map(values => ({
      ...values,
      animatedPosition: new Animated.Value(values.from)
    }))
  ).current

  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {
        states.forEach(state => {
          interpolatePanPositions(state, gestureState.dy)
        })
      },
      onPanResponderRelease: (evt, gestureState) => {
        states.forEach(state => {
          animateNarrative(state)
        })
      }
    })
  }, [])

  const setAccessibilityRef = (el: React.LegacyRef<View>, index: number) => {
    if (index === 0) {
      game._ui.setAccessibilityRef('NarrativeText', el)
    }
  }

  const animateNarrative = (state: TState, callback?: () => void) => {
    Animated.spring(state.animatedPosition, {
      toValue: state.to,
      friction: 9,
      tension: 60,
      useNativeDriver: true
    }).start(callback)
  }

  const interpolatePanPositions = (state: TState, panValueY: number) => {
    const defaultPos = positions()
    const diff = Math.abs(state.from - state.to)
    const divider = Math.abs(defaultPos[0].from - defaultPos[defaultPos.length - 1].to)
    const interpolation = diff / divider
    const newPosition = state.to + interpolation * panValueY

    state.animatedPosition.setValue(newPosition)
  }

  return (
    <View style={style.wrapper} {...panResponder.panHandlers} pointerEvents="box-none">
      {localNarrative.map((narrativeKeys, index) => {
        if ((screenReaderEnabled && index !== 2) || !screenReaderEnabled) {
          const text = narrativeKeys.map(key => t(key, { ns: 'scenes' })).join(' ')
          const hasMarkdown = (text.match(/_+|\*+/g) || []).length > 1
          const animatedPosition = states[index].animatedPosition

          return (
            <Animated.View
              key={index}
              ref={el => setAccessibilityRef(el as React.LegacyRef<View>, index)}
              accessible
              accessibilityLabel={
                index === 0 ? text : `${t('NARRATIVE-PREVIOUS_TEXT-A11Y_LABEL')}: ${text}`
              }
              style={[
                style.textWrapper,
                {
                  transform: [
                    { translateY: animatedPosition },
                    { scale: animatedPosition.interpolate(scaleInterpolation()) }
                  ],
                  opacity: animatedPosition.interpolate(opacityInterpolation())
                }
              ]}
            >
              {hasMarkdown ? (
                <MarkdownView styles={style.markdown}>{text}</MarkdownView>
              ) : (
                <Text style={style.markdown.paragraph}>{text}</Text>
              )}
            </Animated.View>
          )
        } else {
          return null
        }
      })}
    </View>
  )
})
