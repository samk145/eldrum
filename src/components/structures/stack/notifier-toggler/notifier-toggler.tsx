import type Game from '../../../../models/game'

import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { observer } from 'mobx-react'
import { announceForAccessibility } from '../../../../helpers/accessibility'
import Track from '../../../../models/track'
import { Icon } from '../../../units/icon/icon'
import { groupNotificationItems } from '../../notifier/notifier'
import { Text } from '../../../units/text/text'
import style from './notifier-toggler.style'

const sound = require('./notification.m4a') as number

type TNotifierTogglerProps = {
  game: Game
}

@observer
export class NotifierToggler extends React.Component<TNotifierTogglerProps> {
  track = new Track(sound)
  notificationCount: number = this.props.game.notifications.items.length

  componentDidMount(): void {
    this.track.load()
  }

  componentWillUnmount() {
    this.track.stop()
  }

  componentDidUpdate() {
    const { notifications } = this.props.game

    if (notifications.enabled && notifications.items.length > this.notificationCount) {
      this.track.play({
        loop: false
      })
    }

    this.notificationCount = notifications.items.length
  }

  buildNotificationsHint = () => {
    const { notifications } = this.props.game
    const groupedNotifications = groupNotificationItems(notifications.items)
    const hint = groupedNotifications
      .map(group => (group.quantity > 1 ? `${group.quantity}x${group.message}` : group.message))
      .join('\n')

    return hint
  }

  clearNotifications = () => {
    const { notifications } = this.props.game

    announceForAccessibility('Notifications cleared.')
    notifications.clear()
  }

  render() {
    const { notifications } = this.props.game
    const itemCount = notifications.items.length
    const disabled = !notifications.hasItems

    return (
      <TouchableOpacity
        accessibilityLabel={
          itemCount
            ? `Notifications (${itemCount}):\n ${this.buildNotificationsHint()}`
            : 'No notifications'
        }
        accessibilityState={{ disabled }}
        accessibilityRole="button"
        disabled={disabled}
        style={style.container}
        onPress={this.clearNotifications}
      >
        <View style={[style.innerContainer, !notifications.hasItems ? style.disabled : {}]}>
          <Icon
            name="bell"
            height={style.bellIcon.height}
            width={style.bellIcon.width}
            fill={style.bellIcon.color}
          />
          {notifications.hasItems && <Text style={style.count}>{itemCount}</Text>}
        </View>
      </TouchableOpacity>
    )
  }
}
