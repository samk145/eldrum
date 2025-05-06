import React from 'react'
import { TouchableOpacity, View, Linking } from 'react-native'
import { Icon } from '../../units/icon/icon'
import style from './social-links.style'

type TLinkType = 'discord' | 'twitter' | 'facebook'

type TLink = {
  type: TLinkType
  url: string
}

type TSocialLinksProps = {
  onLinkError?: (error: Error) => void
  afterLinkPress?: (link: TLink) => void
}

const links: TLink[] = [
  {
    type: 'discord',
    url: 'https://discord.eldrum.com'
  },
  {
    type: 'facebook',
    url: 'https://www.facebook.com/EldrumRPG'
  }
]

export const SocialLinks = ({
  onLinkError = () => {},
  afterLinkPress = () => {}
}: TSocialLinksProps) => {
  const handleLinkPress = async (link: TLink) => {
    try {
      await Linking.openURL(link.url)
      afterLinkPress(link)
    } catch (error) {
      onLinkError(error as Error)
    }
  }

  return (
    <View style={style.wrapper}>
      {links.map(({ type, url }) => (
        <TouchableOpacity
          key={type}
          accessibilityLabel={type}
          touchSoundDisabled={true}
          style={style.link}
          onPress={() => handleLinkPress({ type, url })}
        >
          <Icon name={type} fill="#FFFFFF" height={style.icon.height} width={style.icon.width} />
        </TouchableOpacity>
      ))}
    </View>
  )
}
