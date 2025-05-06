import type { TUISize } from '../../styles'
import type { StyleProp } from 'react-native'
import React, { memo } from 'react'
import { Image, type ImageStyle } from 'expo-image'
const buttonLeft = require('./button-left.png')
const buttonRight = require('./button-right.png')
const buttonLeftTwo = require('./button-left-2.png')
const buttonRightTwo = require('./button-right-2.png')
const buttonLeftThree = require('./button-left-3.png')
const buttonRightThree = require('./button-right-3.png')
const lineBottom = require('./line-bottom.png')
const lineTop = require('./line-top.png')
const lineRight = require('./line-right.png')
const lineLeft = require('./line-left.png')
const cardTopLeftCorner = require('./card-top-left.png')
const cardTopRightCorner = require('./card-top-right.png')
const cardBottomLeftCorner = require('./card-bottom-left.png')
const cardBottomRightCorner = require('./card-bottom-right.png')
const circleMini = require(`./circle-mini.png`)
const circleSmall = require(`./circle-small.png`)
const circleRegular = require(`./circle-regular.png`)

const DEFAULT_TINT = '#000000'
const CACHE_POLICY = 'memory' // Using disk can cause an issue on Android where the cache retrieves the wrong image.

type TPngPartProps = {
  tint: string | undefined
  style?: StyleProp<ImageStyle>
  onLoad?: () => void
  onError?: () => void
}

type TButtonSideProps = {
  sideWidth: number
  variant?: 1 | 2 | 3
} & TPngPartProps

const buttonLeftSideVariants = [buttonLeft, buttonLeftTwo, buttonLeftThree]

export const ButtonLeftSide = ({
  sideWidth,
  tint = DEFAULT_TINT,
  variant = 1,
  onLoad,
  onError,
  style = {}
}: TButtonSideProps) => (
  <Image
    tintColor={tint}
    source={buttonLeftSideVariants[variant - 1]}
    style={[style, { width: sideWidth, height: '100%' }]}
    contentFit={'contain'}
    onLoadEnd={onLoad}
    onError={onError}
    cachePolicy={CACHE_POLICY}
  />
)

const buttonRightSideVariants = [buttonRight, buttonRightTwo, buttonRightThree]

export const ButtonRightSide = ({
  sideWidth,
  tint = DEFAULT_TINT,
  variant = 1,
  onLoad,
  onError,
  style = {}
}: TButtonSideProps) => (
  <Image
    tintColor={tint}
    source={buttonRightSideVariants[variant - 1]}
    style={[style, { width: sideWidth, height: '100%' }]}
    contentFit={'contain'}
    onLoadEnd={onLoad}
    onError={onError}
    cachePolicy={CACHE_POLICY}
  />
)

type TCornerType = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

type TCardCornerProps = {
  cornerSize: number
  type: TCornerType
} & TPngPartProps

function getCornerImage(type: TCornerType) {
  switch (type) {
    case 'bottom-left':
      return cardBottomLeftCorner
    case 'bottom-right':
      return cardBottomRightCorner
    case 'top-left':
      return cardTopLeftCorner
    case 'top-right':
      return cardTopRightCorner
  }
}

export const CardCorner = ({
  cornerSize,
  tint = DEFAULT_TINT,
  type,
  onLoad,
  onError
}: TCardCornerProps) => {
  return (
    <Image
      tintColor={tint}
      source={getCornerImage(type)}
      style={{ width: cornerSize, height: cornerSize }}
      contentFit={'contain'}
      onLoadEnd={onLoad}
      onError={onError}
      cachePolicy={CACHE_POLICY}
    />
  )
}

export const LineTop = ({ tint = DEFAULT_TINT, style = {}, onLoad, onError }: TPngPartProps) => (
  <Image
    tintColor={tint}
    source={lineTop}
    style={style}
    contentFit={'cover'}
    onLoadEnd={onLoad}
    onError={onError}
    cachePolicy={CACHE_POLICY}
  />
)

export const LineLeft = ({ tint = DEFAULT_TINT, style = {}, onLoad, onError }: TPngPartProps) => (
  <Image
    tintColor={tint}
    source={lineLeft}
    style={style}
    contentFit={'cover'}
    onLoadEnd={onLoad}
    onError={onError}
    cachePolicy={CACHE_POLICY}
  />
)

export const LineRight = ({ tint = DEFAULT_TINT, style = {}, onLoad, onError }: TPngPartProps) => (
  <Image
    tintColor={tint}
    source={lineRight}
    style={style}
    contentFit={'cover'}
    onLoadEnd={onLoad}
    onError={onError}
    cachePolicy={CACHE_POLICY}
  />
)

export const LineBottom = ({ tint = DEFAULT_TINT, style = {}, onLoad, onError }: TPngPartProps) => (
  <Image
    tintColor={tint}
    source={lineBottom}
    style={style}
    contentFit={'cover'}
    onLoadEnd={onLoad}
    onError={onError}
    cachePolicy={CACHE_POLICY}
  />
)

type TPngCircleProps = {
  size: TUISize
} & TPngPartProps

export const Circle = memo(function Circle({
  size = 'small',
  tint = DEFAULT_TINT,
  style = {},
  onLoad,
  onError
}: TPngCircleProps) {
  const imageAsset =
    size === 'regular' ? circleRegular : size === 'small' ? circleSmall : circleMini
  return (
    <Image
      tintColor={tint}
      source={imageAsset}
      style={style}
      contentFit={'contain'}
      onLoadEnd={onLoad}
      onError={onError}
      cachePolicy={CACHE_POLICY}
    />
  )
})
