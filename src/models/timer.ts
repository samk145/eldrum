import { observable, action } from 'mobx'

interface ISettings {
  duration: number
  onComplete: () => void
  onDurationChange: () => void
  onTick: (timer: number) => void
  loop: boolean
  precision: number
}

type TOptions = Partial<ISettings> & { duration: number }

const defaultOptions = {
  duration: 0,
  onComplete: Function,
  onDurationChange: Function,
  onTick: (timer: number) => {},
  loop: false,
  precision: 50
}

export class Timer {
  constructor(options: TOptions = defaultOptions) {
    const settings = Object.assign({ ...defaultOptions }, options)
    this.timer = settings.duration
    this.setOptions(settings)
  }

  countdown?: ReturnType<typeof setTimeout>
  @observable timer = 0
  @observable running = false
  @observable settings: ISettings = defaultOptions

  @action addDuration = (duration = 0) => {
    if (this.countdown) {
      clearTimeout(this.countdown)
    }

    const { settings, start } = this
    const newDuration = this.timer + duration
    this.timer = newDuration > settings.duration ? settings.duration : newDuration
    this.running = false

    settings.onDurationChange()
    start()
  }

  @action setOptions = (options: TOptions = defaultOptions) => {
    this.settings = Object.assign(this.settings, options)

    if (options.duration && !this.timer) {
      this.timer = options.duration
    }

    return this
  }

  @action pause = () => {
    if (this.countdown) {
      clearTimeout(this.countdown)
    }

    this.running = false

    return this
  }

  @action stop = () => {
    if (this.countdown) {
      clearTimeout(this.countdown)
    }
    this.timer = 0
    this.running = false

    return this
  }

  completeTimer = () => {
    const { onComplete } = this.settings
    onComplete()

    if (this.settings.loop && this.running) {
      this.restart()
    } else {
      this.stop()
    }
  }

  @action restart = () => {
    const { duration, precision } = this.settings

    if (this.countdown) {
      clearTimeout(this.countdown)
    }

    this.timer = Timer.round(duration, precision)
    this.running = false

    this.start()

    return this
  }

  @action start = () => {
    const { precision, loop } = this.settings

    if (this.running || (this.timer === 0 && !loop)) {
      return this
    }

    let tickTime = new Date().getTime()

    const tick = () => {
      this.settings.onTick(this.timer)

      if (Timer.round(this.timer, precision) <= 0) {
        this.completeTimer()
      } else {
        const now = new Date().getTime()
        this.timer -= now - tickTime
        tickTime = new Date().getTime()
        this.countdown = setTimeout(tick, precision)
      }
    }

    tick()
    this.running = true
    return this
  }

  static round(milliseconds: number, precision: number) {
    return Math.floor((milliseconds + 1) / precision) * precision
  }
}
