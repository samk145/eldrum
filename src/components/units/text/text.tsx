import React from 'react'
import { Text as RNText, type TextProps } from 'react-native'
import { variables, helpers } from '../../../styles'

const defaultStyle = {
  fontFamily: variables.fonts.default,
  ...helpers.FontSizeAndLineHeight(variables.fonts.body)
}

// This component is used for a single purpose:
// To set the default font on all texts. It used to be
// handled by setting defaultProps on the native Text component
// globally, but that caused two other problems.
// See https://trello.com/c/MLCrYRdT/399-bugg-med-italic-bold-i-markdown
export class Text extends React.Component<TextProps> {
  static defaultProps = {
    allowFontScaling: false,
    maxFontSizeMultiplier: 1
  }

  render() {
    const { style, ...rest } = this.props

    return (
      <RNText style={[defaultStyle, style]} {...rest}>
        {rest.children}
      </RNText>
    )
  }
}
