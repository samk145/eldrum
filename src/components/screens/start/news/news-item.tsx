import type { TNewsItem } from '../../../../stores/ui'

import React from 'react'
import { Linking, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Icon, Text, Card } from '../../../units'
import { variables } from '../../../../styles'
import { logger } from '../../../../helpers/logger'
import { analytics } from '../../../../helpers/analytics'
import styles from './news-item.style'

const CARD_OPACITY = 0.2
const CARD_CORNER_SIZE = variables.distance
const ANALYTICS_CONTEXT = 'news'

const NewsItem = ({ title, linkUrl }: TNewsItem) => {
  const { t } = useTranslation()

  const handlePress = async () => {
    try {
      await Linking.openURL(linkUrl)
      analytics.linkEvent(linkUrl, ANALYTICS_CONTEXT, { title })
    } catch (error) {
      logger.error(error)
    }
  }

  return (
    <Card
      corners="all"
      cardOpacity={CARD_OPACITY}
      cornerSize={CARD_CORNER_SIZE}
      tint={variables.colors.black}
      style={styles.cardStyle}
    >
      <TouchableOpacity
        accessibilityLabel={linkUrl ? `${title} (${t('LINK-A11Y_LABEL')})` : title}
        disabled={!linkUrl}
        style={styles.itemWrapper}
        onPress={handlePress}
      >
        <Text style={styles.itemTitle}>{title}</Text>
        {linkUrl && (
          <View style={styles.iconWrapper}>
            <Icon
              name="link"
              fill="#FFFFFF"
              height={styles.iconSize.height}
              width={styles.iconSize.width}
            />
          </View>
        )}
      </TouchableOpacity>
    </Card>
  )
}

export default NewsItem
