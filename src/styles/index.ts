import { Dimensions, type ScaledSize, StatusBar } from 'react-native'

const windowSize = Dimensions.get('window')
const screenSize = Dimensions.get('screen')

export type TDimensions = ScaledSize & {
  navigationBarHeight: number
  statusBarHeight: number
  aspectRatio: number
}

export type TSizePerDimension = { [key in TDimensionSize]: number }

export type TDimensionSize = 'xxsmall' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'
export type TUISize = 'mini' | 'small' | 'regular'

const dimensions = {
  ...screenSize,
  navigationBarHeight: screenSize.height - windowSize.height,
  statusBarHeight: typeof StatusBar.currentHeight === 'number' ? StatusBar.currentHeight : 0,
  aspectRatio: screenSize.height / screenSize.height
}

const cardRadius: TSizePerDimension = {
  xlarge: 60,
  large: 60,
  medium: 50,
  small: 40,
  xsmall: 40,
  xxsmall: 35
}

/**
 * Retrieves a value from the supplied values, based on the size. Falls back to the second
 * biggest size, so if only the large value is supplied, the rest of the sizes will receive
 * the same value.
 */
const getSizeValue = <T>(xlarge: T, large?: T, medium?: T, small?: T, xsmall?: T, xxsmall?: T) => {
  const size = getSize(dimensions)

  let value

  switch (size) {
    case 'xlarge':
      value = xlarge
      break
    case 'large':
      value = large ?? xlarge
      break
    case 'medium':
      value = medium ?? large ?? xlarge
      break
    case 'small':
      value = small ?? medium ?? large ?? xlarge
      break
    case 'xsmall':
      value = xsmall ?? small ?? medium ?? large ?? xlarge
      break
    case 'xxsmall':
      value = xxsmall ?? xsmall ?? small ?? medium ?? large ?? xlarge
      break
  }

  return value
}

function isWithinDimensions(dimensions: ScaledSize, width: number, height: number) {
  if (dimensions.width <= width && dimensions.height <= height) {
    return true
  }

  return false
}

function getSize(dimensions: TDimensions): TDimensionSize {
  // iPhone 6/7/8/X and equivalent
  if (isWithinDimensions(dimensions, 360, 675)) {
    return 'xxsmall'
  }

  // Narrow but often tall displays, such as Google Pixel 6 or Galaxy S10
  if (isWithinDimensions(dimensions, 360, 900)) {
    return 'xsmall'
  }

  // iPhone 12/13 (mini and non mini), Google Pixel 3 etc.
  if (isWithinDimensions(dimensions, 400, 900)) {
    return 'small'
  }

  // iPhone 11, plus/max variants and equivalent
  if (isWithinDimensions(dimensions, 600, 1000)) {
    return 'medium'
  }

  // All iPads except for the large pro
  if (isWithinDimensions(dimensions, 940, 1350)) {
    return 'large'
  }

  // iPad Pro 12.9 and equivalent
  else {
    return 'xlarge'
  }
}

const size = getSize(dimensions)

function FontSizeAndLineHeight(fontSize: number) {
  return {
    fontSize,
    lineHeight: lineHeightNormalizer(fontSize)
  }
}

function lineHeightNormalizer(fontSize: number) {
  // Round because Android doesn't support more than 1 decimal
  return Math.round(fontSize * 1.1)
}

function Variables(size: TDimensionSize) {
  const distance = {
    xlarge: 25,
    large: 22,
    medium: 18,
    small: 18,
    xsmall: 17,
    xxsmall: 16
  }

  const fontsBody = {
    xlarge: 22,
    large: 20,
    medium: 17,
    small: 16,
    xsmall: 15,
    xxsmall: 15
  }

  return {
    distance: distance[size],
    cardRadius: cardRadius[size],
    borderRadius: {
      modal: 15
    },
    colors: {
      azure: '#0083D1',
      night: '#222222',
      nightLight: '#2C2C2C',
      nightShade: '#1A1A1A',
      matte: '#4E5962',
      turmeric: '#FFBF64',
      garnet: 'rgba(208,85,85,1)',
      emerald: 'rgba(85,208,91,1)',
      black: '#000000',
      faded: '#C6C6C6',
      white: '#FFFFFF',
      gloom: '#CCCCCC',
      charcoal: '#4E5153',
      parchment: '#FFF8DB',
      cinnamon: '#442C20',
      teal: '#3F776B',
      viola: '#A085AC',
      lowHealth: 'rgba(167,53,53,1)',
      highHealth: 'rgba(57,167,53,1)'
    },
    fonts: {
      regular: 'sans-serif-regular',
      regularItalic: 'sans-serif-regular-italic',
      demi: 'sans-serif-demi',
      demiItalic: 'sans-serif-demi-italic',
      bold: 'sans-serif-bold',
      boldItalic: 'sans-serif-bold-italic',
      light: 'sans-serif-light',
      lightItalic: 'sans-serif-light-italic',
      body: fontsBody[size],
      display: 'serif-regular',
      lineHeight: lineHeightNormalizer(fontsBody[size]),
      default: '',
      defaultItalic: ''
    }
  }
}

const variables = Variables(size)

variables.fonts.default = variables.fonts.light
variables.fonts.defaultItalic = variables.fonts.lightItalic

const styles = {
  modalWrapper: {
    backgroundColor: variables.colors.white,
    borderRadius: variables.borderRadius.modal,
    marginBottom: variables.distance,
    flex: 1
  },
  headline: {
    fontSize: variables.fonts.body + 6,
    lineHeight: lineHeightNormalizer(variables.fonts.body + 6),
    fontFamily: variables.fonts.display,
    color: variables.colors.white
  },
  legend: {
    ...FontSizeAndLineHeight(variables.fonts.body - 2),
    fontFamily: variables.fonts.demi,
    color: variables.colors.white,
    textTransform: 'uppercase' as const
  },
  markdown: {
    text: {
      color: variables.colors.white,
      fontFamily: variables.fonts.default,
      ...FontSizeAndLineHeight(variables.fonts.body - 2)
    },
    paragraph: {
      textAlign: 'center',
      color: variables.colors.white,
      fontFamily: variables.fonts.default,
      ...FontSizeAndLineHeight(variables.fonts.body - 2)
    },
    em: {
      fontFamily: variables.fonts.defaultItalic,
      fontStyle: 'normal'
    },
    strong: {
      fontFamily: variables.fonts.demi,
      fontWeight: '400'
    },
    list: {
      fontFamily: variables.fonts.default,
      margin: variables.distance / 2
    },
    listItem: {
      fontFamily: variables.fonts.default,
      flexDirection: 'row',
      marginBottom: variables.distance / 4
    },
    listItemBullet: {
      minWidth: variables.distance / 2,
      marginTop: 0,
      paddingRight: variables.distance / 4,
      color: variables.colors.white
    },
    listItemOrderedContent: {
      fontFamily: variables.fonts.default
    },
    listItemUnorderedContent: {
      fontFamily: variables.fonts.default
    },
    link: {
      color: variables.colors.white,
      textDecorationLine: 'underline'
    }
  }
}

const hexToRgbA = (hex: string, alpha = 1) => {
  let c: any

  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('')

    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]]
    }

    c = '0x' + c.join('')

    return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')'
  }

  throw new Error('Bad Hex')
}

export type TLottieColor = [number, number, number, number] | [number, number, number]

const hexToRgbALottieArray = (hex: string, alpha = 1): TLottieColor => {
  let c: any

  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('')

    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]]
    }

    c = '0x' + c.join('')

    return [((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255, alpha]
  }

  throw new Error('Bad Hex')
}

const helpers = {
  getSizeValue,
  hexToRgbA,
  hexToRgbALottieArray,
  FontSizeAndLineHeight,
  lineHeightNormalizer
}

export { dimensions, helpers, size, styles, variables }
