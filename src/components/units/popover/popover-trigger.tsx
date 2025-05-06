import { observer } from 'mobx-react'
import React, { useEffect, useRef } from 'react'
import { type View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type WithTimingConfig
} from 'react-native-reanimated'
import { useStores } from '../../../contexts'

const LONGPRESS_DELAY = 350

export type TPopoverTriggerRenderFn = (props: {
  onLongPress: () => void
  onPressIn: () => void
  onPressOut: () => void
  delayLongPress: number
  ref: React.RefObject<View>
  isOpen: boolean
}) => React.ReactNode

type TPopoverTriggerProps = {
  content: React.ReactNode
  render: TPopoverTriggerRenderFn
  scale?: number
}

const EASING_CONFIG: WithTimingConfig = {
  duration: 250
}

export const PopoverTrigger = observer(function PopoverTrigger({
  render,
  content,
  scale = 1.1
}: TPopoverTriggerProps) {
  const { ui } = useStores()
  const viewRef = useRef<View>(null)
  const sharedValue = useSharedValue(1)
  const timeout = useRef<NodeJS.Timeout>()

  const style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: sharedValue.value }]
    }
  })

  const onPressIn = () => {
    timeout.current = setTimeout(() => {
      sharedValue.value = withTiming(scale, EASING_CONFIG)
    }, 100)
  }

  const onLongPress = () => {
    if (viewRef.current) {
      ui.openPopover(viewRef, content)
    }
  }

  const onPressOut = () => {
    timeout.current && clearTimeout(timeout.current)
    sharedValue.value = withTiming(1, EASING_CONFIG)
  }

  useEffect(
    () => () => {
      timeout.current && clearTimeout(timeout.current)
    },
    []
  )

  return (
    <Animated.View style={style} ref={viewRef}>
      {render({
        onLongPress,
        onPressIn,
        onPressOut,
        delayLongPress: LONGPRESS_DELAY,
        ref: viewRef,
        isOpen: ui.popoverVisible
      })}
    </Animated.View>
  )
})
