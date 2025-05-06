import React, { memo } from 'react'
import {
  Icon as IconComponent,
  svgsToSkiaSvgs,
  type TIconProps
} from '@actnone/eldrum-engine/components'
import { svgIcons } from '@actnone/eldrum-engine/assets'
import { svgIcons as blackDustSvgIcons } from '~demo/assets/graphics/svg-icons'

const allIcons = svgsToSkiaSvgs({ ...svgIcons, ...blackDustSvgIcons })

export type TBlackDustIconName = keyof typeof allIcons

export const Icon = memo(function Icon({ svgs = allIcons, ...rest }: TIconProps<typeof allIcons>) {
  return <IconComponent svgs={svgs} {...rest} />
})
