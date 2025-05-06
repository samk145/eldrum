import React from 'react'
import { Animated, type ViewProps } from 'react-native'
import type { TState } from '../../../models/marionette'

type TMarionetteProps = {
  state: TState
  isAccessible: boolean
  children?: React.ReactNode
  style: ViewProps['style']
  name: string
}

export class Marionette extends React.Component<TMarionetteProps> {
  shouldComponentUpdate(nextProps: TMarionetteProps) {
    if (nextProps.isAccessible !== this.props.isAccessible) {
      return true
    } else {
      return false
    }
  }

  render() {
    const { state, isAccessible } = this.props

    return (
      <Animated.View
        accessibilityElementsHidden={!isAccessible}
        importantForAccessibility={isAccessible ? 'auto' : 'no-hide-descendants'}
        pointerEvents="box-none"
        style={[
          {
            transform: [
              { translateX: state.translateX },
              { translateY: state.translateY },
              { scale: state.scale }
            ],
            opacity: state.opacity
          },
          this.props.style || undefined
        ]}
      >
        {this.props.children}
      </Animated.View>
    )
  }
}
