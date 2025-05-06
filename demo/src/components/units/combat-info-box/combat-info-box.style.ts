import { StyleSheet } from 'react-native'
import { variables, helpers, styles } from '@actnone/eldrum-engine/styles'

const { colors, distance, fonts } = variables

const sectionPadding = {
  paddingTop: distance / 2,
  paddingBottom: distance / 2,
  paddingRight: distance,
  paddingLeft: distance
}

const style = StyleSheet.create({
  wrapper: {
    position: 'relative',
    paddingTop: distance,
    paddingBottom: distance
  },
  title: {
    ...sectionPadding,
    ...helpers.FontSizeAndLineHeight(fonts.body + 3),
    fontFamily: fonts.display,
    color: colors.white,
    textAlign: 'center',
    textTransform: 'capitalize'
  },
  description: {
    ...sectionPadding
  },
  costsWrapper: {
    ...sectionPadding,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  costWrapper: {
    flexDirection: 'row',
    marginRight: distance / 4,
    marginLeft: distance / 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  costIcon: {
    height: 7,
    width: 7,
    borderRadius: 100,
    backgroundColor: colors.teal
  },
  costValue: {
    ...helpers.FontSizeAndLineHeight(fonts.body - 6),
    marginLeft: distance / 4,
    textAlign: 'center',
    color: colors.white
  },
  flavorText: {
    ...sectionPadding
  },
  iconWrapper: {
    position: 'absolute',
    flexDirection: 'row',
    top: distance / 2,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.05
  },
  effects: {
    marginTop: distance / 2,
    marginBottom: distance / 2,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.nightLight
  },
  effectsLabel: {
    ...helpers.FontSizeAndLineHeight(fonts.body - 6),
    textTransform: 'uppercase',
    textAlign: 'center',
    color: colors.white,
    marginTop: -(fonts.body - 6) / 1.5
  },
  effect: {
    ...sectionPadding
  },
  effectId: {
    ...helpers.FontSizeAndLineHeight(fonts.body - 6),
    textTransform: 'capitalize',
    fontFamily: fonts.demi,
    textAlign: 'center',
    color: colors.white
  },
  effectDescription: {
    color: 'white'
  }
})

const descriptionMarkdownStyles = {
  ...styles.markdown,
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
    textAlign: 'center',
    fontFamily: variables.fonts.default
  },
  text: {
    fontFamily: variables.fonts.default,
    ...helpers.FontSizeAndLineHeight(fonts.body - 5),
    color: colors.white,
    textAlign: 'center'
  },
  strong: {
    fontFamily: variables.fonts.demi
  }
}

const flavorMarkdownStyles = {
  ...styles.markdown,
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
    textAlign: 'center'
  },
  text: {
    ...helpers.FontSizeAndLineHeight(fonts.body - 8),
    fontFamily: fonts.regularItalic,
    color: colors.parchment,
    textAlign: 'center'
  }
}

export { style, descriptionMarkdownStyles, flavorMarkdownStyles }
