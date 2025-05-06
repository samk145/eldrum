import React, { memo, useRef, useEffect } from 'react'
import { Animated } from 'react-native'
// @ts-expect-error: Missing type definitions for 'react-native-markdown-view'
import { MarkdownView } from 'react-native-markdown-view'
import style from './paragraph.style'

type TParagraphProps = {
  id?: string
  onIdChange?: (id?: string) => void
  text: string
}

const AnimatedMarkdown = Animated.createAnimatedComponent(MarkdownView)

const Paragraph = ({ text, onIdChange, id }: TParagraphProps) => {
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      useNativeDriver: true
    }).start()
  }, [])

  useEffect(() => {
    if (onIdChange) {
      onIdChange(id)
    }
  }, [id])

  return (
    <AnimatedMarkdown style={{ opacity }} styles={style}>
      {text}
    </AnimatedMarkdown>
  )
}

export default memo(Paragraph)
