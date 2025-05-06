import type { IPlaythroughInstance } from '../../../structures/playthrough/playthrough'

import React, { useEffect, useRef, useCallback } from 'react'
import { View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native'
import { observer } from 'mobx-react'
import Carousel, {
  type ICarouselInstance,
  type TCarouselProps
} from 'react-native-reanimated-carousel'
import { useTranslation } from 'react-i18next'
import { useSharedValue } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useConfig, useStores } from '../../../../contexts/stores'
import { variables, dimensions } from '../../../../styles'
import { Playthrough } from '../../../structures'
import { Button, Card, Text } from '../../../units'
import style from './load.style'
import PaginationItem from './pagination-item'
import UrlLoadModal from './load-from-url-modal'

const pangestureHandlerProps = {
  activeOffsetX: [-10, 10] as [number, number]
}

type TStorageProps = {
  backAction: (e?: GestureResponderEvent) => void
  lockPlaythrough: boolean
}

const Load = ({ backAction, lockPlaythrough }: TStorageProps) => {
  const { saves, play } = useStores()
  const { t } = useTranslation()
  const config = useConfig()
  const currentPlaythrough = saves.playthroughs.filter(
    playthrough => play.game && playthrough[0].saveData?._id === play.game?._id
  )
  const otherPlaythroughs = lockPlaythrough
    ? []
    : saves.playthroughs.filter(playthrough => playthrough[0].saveData?._id !== play.game?._id)
  const sortedPlaythroughs = [...currentPlaythrough, ...otherPlaythroughs]
  const overrideIndex = sortedPlaythroughs.findIndex(
    p => p[0].saveData?._id === saves.overrideSelectedPlaythrough
  )
  const defaultIndex = overrideIndex > -1 ? overrideIndex : 0
  const carousel = React.useRef<ICarouselInstance>(null)
  const playthroughRefs = React.useRef<IPlaythroughInstance[]>([])
  const carouselHeight = useRef(0)
  const progressValue = useSharedValue<number>(0)
  const [currentIndex, setCurrentIndex] = React.useState(defaultIndex)

  const [showUrlModal, setShowUrlModal] = React.useState(false)
  const { colors } = variables

  const handleShowUrlModal = () => {
    setShowUrlModal(true)
  }

  const handleCloseUrlModal = () => {
    setShowUrlModal(false)
  }

  const handleSubmitUrl = (url: string) => {
    play.loadFromUrl(url)
    handleCloseUrlModal()
  }

  const callScrollToTopFromItem = (index: number) => {
    const selectedPlaythroughRef = playthroughRefs.current[index]

    if (selectedPlaythroughRef) {
      selectedPlaythroughRef.scrollToTop()
    }
  }

  const onLayout = (event: LayoutChangeEvent) => {
    carouselHeight.current = event.nativeEvent.layout.height
  }

  const onSnapToItem = useCallback((index: number) => {
    callScrollToTopFromItem(index)
    setCurrentIndex(index)
  }, [])

  const onProgressChange: TCarouselProps['onProgressChange'] = useCallback(
    (offsetProgress: number, absoluteProgress: number) => {
      progressValue.value = absoluteProgress
    },
    []
  )

  const renderItem: TCarouselProps['renderItem'] = useCallback(({ item, index }) => {
    return (
      <Card corners="all" style={style.card} onLoadAnimationDuration={200}>
        <Playthrough
          ref={el => {
            if (el) {
              playthroughRefs.current[index] = el
            }
          }}
          playthrough={item}
          enableContextualMenu
        />
      </Card>
    )
  }, [])

  useEffect(() => {
    saves.resetPlaythroughSelectionOverride()
  }, [])

  useEffect(() => {
    if (sortedPlaythroughs.length === 0) {
      backAction()
    }
  }, [sortedPlaythroughs.length])

  return (
    <SafeAreaView style={style.wrapper}>
      <Text style={style.header}>{t('LOAD-HEADLINE')}</Text>
      <View style={style.carouselWrapper} onLayout={onLayout}>
        <Carousel
          panGestureHandlerProps={pangestureHandlerProps}
          ref={carousel}
          scrollAnimationDuration={500}
          width={dimensions.width}
          height={carouselHeight.current}
          defaultIndex={defaultIndex}
          pagingEnabled
          onSnapToItem={onSnapToItem}
          snapEnabled
          windowSize={2}
          onProgressChange={onProgressChange}
          loop={false}
          data={sortedPlaythroughs}
          renderItem={renderItem}
        />
      </View>

      {!!progressValue && (
        <View style={style.paginationItemWrapper}>
          {sortedPlaythroughs.map((_, index) => {
            return (
              <PaginationItem
                carouselRef={carousel}
                backgroundColor={colors.white}
                animValue={progressValue}
                currentIndex={currentIndex}
                index={index}
                key={index}
                length={sortedPlaythroughs.length}
              />
            )
          })}
        </View>
      )}

      <View style={style.backButtonWrapper}>
        {(config.environment === 'development' || __DEV__) && (
          <Button
            size="regular"
            label={t('LOAD-LOAD_FROM_URL-BUTTON-LABEL')}
            onPress={handleShowUrlModal}
          />
        )}
        <Button size="regular" label={t('BUTTON-BACK-LABEL')} onPress={backAction} />
      </View>

      <UrlLoadModal
        visible={showUrlModal}
        onClose={handleCloseUrlModal}
        onSubmit={handleSubmitUrl}
      />
    </SafeAreaView>
  )
}

export default observer(Load)
