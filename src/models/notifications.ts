import { observable, action, computed, reaction } from 'mobx'
import type Game from './game'

export class Notification {
  constructor(
    public message: string,
    public timeToHide: number = Notification.defaultTimeToHide
  ) {}

  createdAt: number = new Date().getTime()

  static defaultTimeToHide = 5000
}

export class Notifications {
  constructor(private readonly _game: Game) {}

  autoCloseTimeout: NodeJS.Timeout | null = null
  @observable items: Notification[] = []
  @observable timeToHide = null
  @observable visible = false
  @observable enabled = true

  @computed get longestTimeToHide() {
    return this.items.reduce((timeToHide, n) => {
      return n.timeToHide > timeToHide ? n.timeToHide : timeToHide
    }, Notification.defaultTimeToHide)
  }

  @computed get hasItems() {
    return !!this.items.length
  }

  @action create = (text: string, timeToHide?: number) => {
    this.items = [...this.items, new Notification(text, timeToHide)]
  }

  @action open = () => {
    this.visible = true
  }

  @action close = () => {
    this.visible = false
  }

  @action disable = () => (this.enabled = false)

  @action enable = () => (this.enabled = true)

  @action toggleEnabled = () => (this.enabled = !this.enabled)

  @action show = () => {
    const { screenReaderEnabled } = this._game._ui

    if (screenReaderEnabled) {
      return
    }

    this.open()
    this.autoClose(this.longestTimeToHide)
  }

  /**
   * Auto closes notifications after X ms. If it's already open, the timeout
   * will simply be renewed with the new timer.
   */
  @action autoClose = (timeToHide = Notification.defaultTimeToHide) => {
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout)
    }

    this.autoCloseTimeout = setTimeout(this.close, timeToHide)
  }

  @action clear = () => {
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout)
    }

    this.items = []

    if (this.visible) {
      this.close()
    }
  }

  newItemReaction = reaction(
    () => this.items,
    items => {
      if (!items.length) {
        return
      }

      if (this.enabled) {
        this.show()
      }
    },
    { name: 'NotificationsNewItemReaction' }
  )

  onEnableFlush = reaction(
    () => this.enabled,
    isEnabled => {
      if (isEnabled && this.hasItems) {
        this.show()
      }
    },
    { name: 'NotificationsOnEnableFlushReaction' }
  )

  onCombatStart = reaction(
    () => this._game.combat,
    combat => {
      if (combat) {
        this.disable()
      } else {
        this.enable()
      }
    },
    { name: 'NotificationsOnEnableFlushReaction' }
  )
}
