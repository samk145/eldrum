import { AccessibilityInfo } from 'react-native'
import { delay } from './misc'

/**
 * Makes an estimate on how much time will be needed for the screenreader
 * to announce a message.
 */
export const getAccessibilityDelay = (
  string: string,
  delayPerCharacter: number = 85,
  delayPerNumber: number = 220
) => {
  const splitString = string.split('')
  let delay: number = 0

  splitString.forEach(character => {
    const asNumber = Number(character)

    delay += !isNaN(asNumber) || character === '-' ? delayPerNumber : delayPerCharacter
  })

  return delay
}

/**
 * Announces a message using the device's screenreader, along with an
 * added delay. Useful for when you need to wait until a message has been
 * announced, since there's no callback available in AccessibilityInfo.announceForAccessibility
 */
export const announceForAccessibility = async (
  message: string,
  delayPerCharacter?: number,
  delayPerNumber?: number
) => {
  AccessibilityInfo.announceForAccessibility(message)
  await delay(getAccessibilityDelay(message, delayPerCharacter, delayPerNumber))
}
