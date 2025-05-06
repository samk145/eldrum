import React, { useEffect, type LegacyRef } from 'react'
import { View, type ViewProps } from 'react-native'
import { useStores } from '../../../contexts/stores'

type TAccessibilityFocusProps = {
  id: string
  shouldFocus?: boolean | (() => boolean)
  focusOnMount?: boolean
  focusOnUpdate?: boolean
  delay?: number
} & ViewProps

export const AccessibilityFocus = ({
  id,
  shouldFocus = true,
  focusOnMount = true,
  focusOnUpdate = true,
  delay = 15,
  children,
  ...rest
}: TAccessibilityFocusProps) => {
  const { ui } = useStores()

  const determineIfFocusShouldSet = () => {
    if ((typeof shouldFocus === 'function' && shouldFocus()) || shouldFocus === true) {
      ui.setAccessibilityFocus(id, delay)
    }
  }

  useEffect(() => {
    if (focusOnMount) {
      determineIfFocusShouldSet()
    }
  }, [])

  useEffect(() => {
    if (focusOnUpdate) {
      determineIfFocusShouldSet()
    }
  })

  const setAccessibilityRef = (el: LegacyRef<View> | undefined) => {
    if (el) {
      ui.setAccessibilityRef(id, el)
    }
  }

  return (
    <View accessible={true} ref={setAccessibilityRef} {...rest}>
      {children}
    </View>
  )
}
