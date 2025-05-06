import React from 'react'
import { View } from 'react-native'
import { useStores } from '../../../../contexts/stores'
import style from './news.style'
import TNewsItem from './news-item'

const randomFromList = (array: any[]) => {
  return array[Math.floor(Math.random() * array.length)]
}

const News = () => {
  const { ui } = useStores()
  const items = ui.newsItems
  const itemsWithoutPrevious =
    items.length === 1
      ? items
      : items.filter(newsItem => !(ui.previousNewsItem && newsItem === ui.previousNewsItem))
  const item = itemsWithoutPrevious.length ? randomFromList(itemsWithoutPrevious) : null
  ui.previousNewsItem = item

  if (!item) {
    return null
  }

  return (
    <View style={style.wrapper}>
      <TNewsItem title={item.title} linkUrl={item.linkUrl} />
    </View>
  )
}

export default News
