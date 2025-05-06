import moment from 'moment/min/moment-with-locales'

const truncate = (string: string, length: number = 25) =>
  string.length > length ? string.substring(length, 0).trim() + '…' : string

type TRectangle = { top?: number; right?: number; bottom?: number; left?: number }

const Rect = (top?: number, right?: number, bottom?: number, left?: number): TRectangle => {
  const rectangle: TRectangle = {}

  if (top) rectangle.top = top
  if (right) rectangle.right = right
  if (bottom) rectangle.bottom = bottom
  if (left) rectangle.left = left

  return rectangle
}

const sum = (values = [1, 2]) => values.reduce((sum, value) => (sum += value), 0)

const randomIntegerFromInterval = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min)

const randomNumberFromInterval = (min: number, max: number) => Math.random() * (max - min) + min

const randomFromList = <Value>(array: Value[]) => {
  return array[Math.floor(Math.random() * array.length)]
}

const randomIndexFromList = <Value>(array: Value[]): number => {
  return Math.floor(Math.random() * array.length)
}

/**
 * Randomly reorders all elements in an array
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  return array.reduce((a: T[], x, i) => {
    a.splice(Math.floor(Math.random() * (i + 1)), 0, x)
    return a
  }, [])
}

const averageValue = (array: number[]) => {
  return array.reduce((a: number, b: number) => a + b) / array.length
}

const decimalFormat = function (number = 0, decimals = 0) {
  let formatted = null

  if (!decimals) {
    formatted = number.toFixed(decimals)
  } else {
    formatted = number.toFixed(decimals).replace(/\.?0+$/, '')
  }

  return Number(formatted)
}

export const clampBetween = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max)
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export type TStringOperator =
  | 'equals'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lowerThan'
  | 'lowerThanOrEqual'

const evaluateUsingStringOperator = (
  operator: TStringOperator,
  value1: number | string,
  value2: number | string
) => {
  if (operator === 'equals') {
    return value1 === value2
  } else if (operator === 'greaterThan') {
    return value1 > value2
  } else if (operator === 'greaterThanOrEqual') {
    return value1 >= value2
  } else if (operator === 'lowerThan') {
    return value1 < value2
  } else if (operator === 'lowerThanOrEqual') {
    return value1 <= value2
  }

  return false
}

const formatTimestamp = (timestamp: number, locale: string = 'en') => {
  moment.locale(locale)
  const time = moment(timestamp)
  const isWithinAFewDays = moment().diff(time, 'days') < 5
  const isToday = time.isSame(new Date(), 'day')
  const isThisYear = time.isSame(new Date(), 'year')
  const isWithinAnHour = moment().diff(time, 'hours') < 1

  if (isWithinAnHour) {
    return time.fromNow()
  } else if (isToday) {
    return time.format('H:mm a')
  } else if (isWithinAFewDays) {
    return time.format('ddd H:mm a')
  } else if (isThisYear) {
    return time.format('Do MMM H:mm a')
  } else {
    return time.format('Do MMM YYYY')
  }
}

const getSiblingRangeFromList = <T>(array: T[] = [], currentIndex = 0, range = 1) => {
  if (array[currentIndex] === undefined) {
    throw new Error('getSiblingRangeFromList: Cannot access out of bounds index on array')
  }

  const values: T[] = []

  for (let i = currentIndex - 1; i >= currentIndex - range; i--) {
    if (array[i]) {
      values.unshift(array[i])
    }
  }

  for (let i = currentIndex + 1; i <= currentIndex + range; i++) {
    if (array[i]) {
      values.push(array[i])
    }
  }

  return values
}

type TUuid = string

const uuid = (): TUuid => {
  let dt = new Date().getTime()

  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (dt + Math.random() * 16) % 16 | 0
    dt = Math.floor(dt / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })

  return uuid
}

const ObjectId = (m = Math, d = Date, h = 16, s = (s: any) => m.floor(s).toString(h)) =>
  s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h))

/**
 * Sequential promise resolver
 *
 * @param   {Function[]} list - A list of functions. Each function must return a promise
 * @return  {Promise}
 */
const sequentialPromiseResolver = <Type = any>(array: (() => Promise<Type>)[] = []) =>
  new Promise<Type[]>(async (resolve, reject) => {
    const results: Type[] = []

    for (let i = 0; i < array.length; i++) {
      const promise = array[i]

      try {
        results.push(await promise())
      } catch (error) {
        return reject(error)
      }
    }

    resolve(results)
  })

const initialsFromString = (string: string = '') => {
  const initials = string.replace(/[^a-zA-Z- ]/g, '').match(/\b\w/g)

  return initials ? initials.join('').toUpperCase() : ''
}

const capitalize = (value: string) => {
  const splitStr = value.toLowerCase().split(' ')

  for (let i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1)
  }

  return splitStr.join(' ')
}

const formatPercentage = (value: number) => parseInt((value * 100).toFixed(0)) + '%'

const capitalizeCamelCase = (value: string) => {
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
    return str.toUpperCase()
  })
}

export const camelCaseToConstCase = <T extends string = string>(value: T) => {
  return value.replace(/([a-z\d])([A-Z])/g, '$1_$2').toUpperCase() as Uppercase<T>
}

/**
 * Returns a suitable timestamp some time in the future. The times
 * are based on analytics data from players.
 */
const getNotificationTimestamp = (timestamp: number) => {
  const date = new Date(timestamp)
  const day = date.getDate()
  const hour = date.getHours()

  if (hour < 6) {
    date.setHours(10)
  } else if (hour >= 6 && hour <= 10) {
    date.setHours(17)
  } else if (hour >= 10 && hour <= 17) {
    date.setDate(day + 1)
    date.setHours(6)
  } else if (hour >= 17) {
    date.setDate(day + 1)
    date.setHours(10)
  }

  date.setMinutes(0)
  date.setSeconds(0)

  return date.getTime()
}

const shortenObjectId = (id: string) => {
  return id.slice(-6)
}

export {
  averageValue,
  capitalize,
  capitalizeCamelCase,
  decimalFormat,
  delay,
  evaluateUsingStringOperator,
  formatPercentage,
  formatTimestamp,
  getNotificationTimestamp,
  getSiblingRangeFromList,
  initialsFromString,
  ObjectId,
  randomFromList,
  randomIndexFromList,
  randomIntegerFromInterval,
  randomNumberFromInterval,
  Rect,
  sequentialPromiseResolver,
  shortenObjectId,
  sum,
  truncate,
  uuid
}

export type { TUuid }
