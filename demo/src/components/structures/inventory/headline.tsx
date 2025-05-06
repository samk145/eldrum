import React from 'react'
import { View } from 'react-native'
import { AccessibilityFocus, Text } from '@actnone/eldrum-engine/components'
import style from './headline.style'

const Headline = ({ name, description }: { name: string; description: string }) => (
  <View>
    <Text style={style.headline}>{name}</Text>
    <AccessibilityFocus
      id="ItemSelection"
      focusOnMount
      focusOnUpdate={false}
      style={style.descriptionWrapper}
    >
      <Text style={style.description}>{description}</Text>
    </AccessibilityFocus>
  </View>
)

export default Headline
