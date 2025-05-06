import React from 'react'
import { Platform } from 'react-native'
import { Image, type ImageProps } from 'expo-image'
import { useStores } from '../../../contexts'

const CACHE_POLICY = Platform.OS === 'ios' ? 'memory-disk' : 'memory'

export const MediaImage = ({ media, ...rest }: { media: string } & Omit<ImageProps, 'source'>) => {
  const { content } = useStores()
  const source = content.getMediaSource('image', media)

  return <Image source={source} {...rest} cachePolicy={CACHE_POLICY} />
}
