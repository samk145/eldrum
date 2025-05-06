import React from 'react'
import { type ViewStyle, StyleSheet } from 'react-native'
import Constants from 'expo-constants'
import LottieView from 'lottie-react-native'
import LottieAnimationFile from './rook-dagger-lottie.json'
import { helpers, variables, type TLottieColor } from '../../../styles'

const env = Constants.expoConfig?.extra ?? {}

const RIBBON_COLOR: TLottieColor = helpers.hexToRgbALottieArray(
  (env.LOADER_RIBBON_COLOR as string) || variables.colors.white
)
const DAGGER_COLOR: TLottieColor = helpers.hexToRgbALottieArray(
  (env.LOADER_DAGGER_COLOR as string) || variables.colors.white
)

const DEFAULT_RIBBON_COLOR: TLottieColor = [0.760784327984, 0.760784327984, 0.760784327984, 1]
const DEFAULT_DAGGER_COLOR: TLottieColor = [0.098039215686, 0.090196078431, 0.098039215686, 1]

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace)
}

const finalLottieAnimation = (() => {
  let s = JSON.stringify(LottieAnimationFile)

  s = replaceAll(s, JSON.stringify(DEFAULT_RIBBON_COLOR), JSON.stringify(RIBBON_COLOR))
  s = replaceAll(s, JSON.stringify(DEFAULT_DAGGER_COLOR), JSON.stringify(DAGGER_COLOR))

  return JSON.parse(s)
})()

type TLoadingIndicatorProps = {
  style?: ViewStyle
  size?: number
}

export function LoadingIndicator({ style, size = 250 }: TLoadingIndicatorProps) {
  return (
    <LottieView
      style={{ ...defaultStyle.container, width: size, height: size, ...style }}
      source={finalLottieAnimation}
      autoPlay={true}
    />
  )
}

const defaultStyle = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center'
  }
})
