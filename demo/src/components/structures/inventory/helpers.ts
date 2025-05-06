import type { TItem } from '@actnone/eldrum-engine/models'
import { formatPercentage } from '@actnone/eldrum-engine/helpers'

export const formatUsageValue = (item: TItem) => {
  let value: string | number = ''

  if (item.consumption && item.consumption.uses === 1) {
    value = item.consumption.uses
  } else if (item.consumption?.uses && 'usages' in item && typeof item.usages === 'number') {
    value = `${item.consumption.uses - item.usages} / ${item.consumption.uses}`
  } else if (item.consumption?.uses) {
    value = item.consumption.uses
  }

  return value
}

export const formatStatModifier = (
  value: number,
  statName: string,
  type: 'factor' | 'term' | 'set'
) => {
  const isPercentageStat = statName.toLocaleLowerCase().includes('chance')
  let prefix: string = value > 1 ? '+' : ''
  const suffix: string = ''
  let formattedValue: string | number = value

  if (isPercentageStat) {
    formattedValue = formatPercentage(value)
  }

  if (type === 'factor') {
    formattedValue = formatPercentage(value - 1)
  } else if (type === 'term') {
    prefix = value > 0 ? '+' : ''
  } else if (type === 'set') {
    prefix = '='
  }

  return `${prefix}${formattedValue}${suffix}`
}
