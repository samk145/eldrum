import { useState, useRef, useEffect } from 'react'
import { AccessibilityInfo } from 'react-native'

function useScreenReaderInfo() {
  const [isScreenReaderEnabled, setScreenReaderEnabled] = useState(false)

  const eventListenerRef = useRef(
    AccessibilityInfo.addEventListener('change', setScreenReaderEnabled)
  )

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReaderEnabled)

    return () => eventListenerRef.current.remove()
  }, [])

  return isScreenReaderEnabled
}

export { useScreenReaderInfo }
