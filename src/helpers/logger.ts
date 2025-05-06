import * as Sentry from '@sentry/react-native'

type Config = {
  dsn: string
  environment: string
  traceSampleRate?: number
  profilesSampleRate?: number
}

class Logger {
  setup = (config: Config) => {
    Sentry.init({
      dsn: config.dsn,
      enabled: !__DEV__,
      environment: config.environment,
      tracesSampleRate: config.traceSampleRate || 0,
      profilesSampleRate: config.profilesSampleRate || 0
    })

    this.enabled = true
    this.sentry = Sentry
  }

  enabled: boolean = false
  sentry?: typeof Sentry

  info = (...messages: unknown[]) => {
    if (this.enabled) {
      Sentry.captureMessage(messages.join(', '))
    }

    if (__DEV__) {
      console.log(...messages)
    }
  }

  error = (error: unknown | Error | string | ({ message: string } & Record<string, any>)) => {
    if (this.enabled) {
      if (error instanceof Error) {
        Sentry.captureException(error)
      } else if (typeof error === 'string') {
        Sentry.captureMessage(error)
      } else if (
        typeof error === 'object' &&
        error &&
        'message' in error &&
        typeof error.message === 'string'
      ) {
        Sentry.setContext('extra', error)
        Sentry.captureMessage(error.message || 'An error occurred')
      }
    }

    if (__DEV__) {
      console.error(error)
    }
  }

  warn = (...messages: unknown[]) => {
    if (this.enabled) {
      Sentry.captureMessage(messages.join(', '))
    }

    if (__DEV__) {
      console.warn(...messages)
    }
  }

  debug = (...messages: unknown[]) => {
    if (__DEV__) {
      console.log(...messages)
    }
  }

  console = (obj: unknown) => {
    if (__DEV__) {
      console.log(JSON.stringify(obj, null, 2))
    }
  }
}

class ExecutionTimer {
  timers: Record<
    string,
    {
      start: number
      end: number
      duration: number
    }
  > = {}

  start = (name: string) => {
    this.timers[name] = {
      start: performance.now(),
      end: 0,
      duration: 0
    }

    console.log(`ExecutionTimer: ${name} - Start`)
  }

  stop = (name: string) => {
    this.timers[name].end = performance.now()
    this.timers[name].duration = this.timers[name].end - this.timers[name].start

    console.log(`ExecutionTimer: ${name} - End ${this.timers[name].duration.toFixed(2)} ms`)

    /* eslint-disable */
    delete this.timers[name]
    /* eslint-enable */
  }
}

export const executionTimer = new ExecutionTimer()

export const logger = new Logger()
