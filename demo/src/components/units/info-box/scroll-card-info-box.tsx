import React, { useEffect, useRef } from 'react'
import { StyleSheet, ScrollView, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Card, Text } from '@actnone/eldrum-engine/components'
import { styles, variables, helpers } from '@actnone/eldrum-engine/styles'
import { type InfoBoxProps, InfoBox } from './info-box'

const { distance, colors } = variables

type TScrollCardInfoBoxProps = {
  children?: React.ReactNode
  footer?: React.ReactNode
} & InfoBoxProps

const CARD_TINT = colors.nightShade

export const ScrollCardInfoBox = ({
  title,
  children,
  footer,
  ...props
}: TScrollCardInfoBoxProps) => {
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false })
    }
  }, [title])

  return (
    <>
      <Text style={style.headline}>{title}</Text>
      <Card cornerSize={distance} corners="all" tint={colors.nightShade} style={style.card}>
        <ScrollView ref={scrollViewRef} contentContainerStyle={style.scrollContainer}>
          <InfoBox {...props} style={style.infoBox} />
          {children}
        </ScrollView>
        <LinearGradient
          style={style.moreIndicator}
          colors={[helpers.hexToRgbA(CARD_TINT, 0), CARD_TINT]}
        />
        {footer && <View style={style.footer}>{footer}</View>}
      </Card>
    </>
  )
}

const style = StyleSheet.create({
  headline: {
    ...styles.headline,
    textAlign: 'center',
    marginBottom: distance
  },
  card: {
    position: 'relative'
  },
  scrollContainer: {
    padding: distance,
    flexGrow: 1
  },
  infoBox: {
    flex: 1,
    justifyContent: 'center'
  },
  moreIndicator: {
    position: 'absolute',
    bottom: 0,
    left: distance,
    right: distance,
    height: distance
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.nightLight,
    marginRight: 1,
    marginLeft: 1
  }
})
