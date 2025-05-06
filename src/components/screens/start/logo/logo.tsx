import React from 'react'
import { type ViewProps } from 'react-native'
import { AccessibilityFocus } from '../../../units'
import { SvgXml } from 'react-native-svg'
import { useStores } from '../../../../contexts/stores'

const FILL = '#FFF'

type TLogoProps = {
  width?: number
  accessibilityLabel: string
  originalDimensions: { width: number; height: number }
  xml: string
} & ViewProps

export default function Logo({
  width = 350,
  accessibilityLabel,
  originalDimensions,
  xml,
  ...rest
}: TLogoProps) {
  const { saves, play } = useStores()

  return (
    <AccessibilityFocus
      id="StartLogo"
      accessibilityLabel={accessibilityLabel}
      shouldFocus={(!play.game && !saves.hasAnySave) || play.gameWasJustCompleted}
      {...rest}
    >
      <SvgXml
        xml={xml}
        width={width}
        height={(width * originalDimensions.height) / originalDimensions.width}
        fill={FILL}
      />
    </AccessibilityFocus>
  )
}
