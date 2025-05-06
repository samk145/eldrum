import type { Stores } from '../../../stores'
import React, { Component } from 'react'
import { View, Animated, TouchableOpacity, type LayoutChangeEvent } from 'react-native'
import { observable, computed, reaction, type IReactionDisposer } from 'mobx'
import { observer } from 'mobx-react'
import { withStores } from '../../../contexts/stores'
import { type Notification } from '../../../models/notifications'
import { Card } from '../../units/card/card'
import { Text } from '../../units/text/text'
import style from './notifier.style'

const reversed = {
  inputRange: [0, 1],
  outputRange: [1, 0]
}

export const groupNotificationItems = (items: Notification[]) => {
  return items.reduce((groupedItems: TNotificationGroup[], currentItem: Notification) => {
    const existingGroup = groupedItems.find(i => i.message === currentItem.message)

    if (existingGroup) {
      existingGroup.quantity = existingGroup.quantity + 1
      existingGroup.createdAt = currentItem.createdAt
      existingGroup.timeToHide = currentItem.timeToHide
      existingGroup.items = [...existingGroup.items, currentItem]
      return groupedItems
    } else {
      const newGroup: TNotificationGroup = {
        quantity: 1,
        message: currentItem.message,
        createdAt: currentItem.createdAt,
        timeToHide: currentItem.timeToHide,
        items: [currentItem]
      }

      const newGroupedItems = [...groupedItems, newGroup]
      return newGroupedItems
    }
  }, [])
}

type TNotificationGroup = {
  quantity: number
  message: string
  createdAt: number
  timeToHide: number
  items: Notification[]
}

type TNotifierProps = {
  stores?: Stores
  onHeightChange?: (newHeight: number) => void
}

@observer
class Notifier extends Component<TNotifierProps> {
  notificationChange: IReactionDisposer
  height: number
  constructor(props: TNotifierProps) {
    super(props)

    this.height = 0

    this.notificationChange = reaction(
      () => this.visible,
      visible => {
        if (visible) {
          this.animateIn()
        } else if (!visible) {
          this.animateOut()
        }
      },
      { name: 'notificationChange' }
    )
  }

  componentWillUnmount() {
    this.notificationChange()
    this.props.stores!.play.game?.notifications.clear()
  }

  @observable positionY = new Animated.Value(0)

  @computed get items() {
    return this.props.stores!.play.game!.notifications.items
  }

  @computed get groupedItems() {
    return groupNotificationItems(this.items)
  }

  @computed get visible() {
    return this.props.stores!.play.game!.notifications.visible
  }

  animateIn = () => {
    Animated.spring(this.positionY, {
      toValue: this.height,
      friction: 9,
      tension: 60,
      useNativeDriver: true
    }).start()
  }

  animateOut = () => {
    Animated.timing(this.positionY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(this.props.stores!.play.game!.notifications.clear)
  }

  handleLayoutChange = ({ nativeEvent }: LayoutChangeEvent) => {
    const { onHeightChange } = this.props
    const { height } = nativeEvent.layout

    this.height = height

    if (onHeightChange) {
      onHeightChange(this.items.length ? height : 0)
    }

    if (this.visible) {
      this.animateIn()
    } else if (!this.items.length) {
      this.positionY.setValue(0)
    }
  }

  renderItems = () =>
    this.groupedItems.map((notificationGroup, index) => (
      <View key={index} style={style.notification}>
        {notificationGroup.quantity > 1 && (
          <View style={style.quantityWrapper}>
            <Text style={style.quantityLabel}>{notificationGroup.quantity}</Text>
          </View>
        )}
        <Text accessible={false} style={style.text}>
          {notificationGroup.message}
        </Text>
      </View>
    ))

  render() {
    const { positionY, height, handleLayoutChange } = this

    return (
      <Animated.View
        pointerEvents={'box-none'}
        style={[
          style.wrapper,
          {
            transform: [
              {
                translateY: positionY.interpolate(reversed)
              }
            ],
            opacity: positionY.interpolate({
              inputRange: [0, height],
              outputRange: [0, 1]
            })
          }
        ]}
        onLayout={handleLayoutChange}
      >
        <Card tint={style.card.backgroundColor} style={style.notificationsWrapper}>
          <TouchableOpacity
            touchSoundDisabled={true}
            onPress={this.props.stores!.play.game!.notifications.close}
          >
            {this.renderItems()}
          </TouchableOpacity>
        </Card>
      </Animated.View>
    )
  }
}

export default withStores(Notifier)
