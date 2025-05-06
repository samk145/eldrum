import React from 'react'
import {
  View,
  Animated,
  Pressable,
  type LayoutChangeEvent,
  type StyleProp,
  type TextStyle
} from 'react-native'
import { t } from '../../../i18n'
import { Text } from '../text/text'
import style from './progress-bar.style'

type TProgressBarProps = {
  borderRadius?: number
  height?: number
  color?: string | string[]
  value: number
  minValue?: number
  maxValue: number
  accessibilityLabel?: string
  showValues?: boolean
  showValuesOnPress?: boolean
  valueStyles?: StyleProp<TextStyle>
  valuesLabel?: string
  screenReaderEnabled?: boolean
}

type TProgressBarState = {
  bgColor: Animated.Value
  position: Animated.Value
  width: number
  showValues: boolean
}

export class ProgressBar extends React.Component<TProgressBarProps> {
  constructor(props: TProgressBarProps) {
    super(props)
    const value = this.getValueInPercentage(props.value, props.maxValue)

    this.state = {
      bgColor: new Animated.Value(value),
      position: new Animated.Value(value),
      width: 0,
      showValues: props.showValues ?? false
    }
  }

  state: TProgressBarState

  static defaultProps = {
    minValue: 0
  }

  UNSAFE_componentWillReceiveProps(nextProps: TProgressBarProps) {
    const { bgColor } = this.state

    if (nextProps.value !== bgColor.position) {
      this.changeValue(nextProps.value, nextProps.maxValue, true)
    } else if (nextProps.maxValue !== this.props.maxValue) {
      this.changeValue(nextProps.value, nextProps.maxValue, false)
    }
  }

  changeValue = (value: number, maxValue: number, animate: boolean = true) => {
    const { position, bgColor } = this.state
    const newValue = this.getValueInPercentage(value, maxValue)

    const animations = [
      Animated.spring(position, {
        toValue: newValue,
        bounciness: 2,
        velocity: 4,
        useNativeDriver: true
      })
    ]

    if (typeof this.props.color !== 'string') {
      animations.push(
        Animated.spring(bgColor, {
          toValue: newValue,
          bounciness: 2,
          velocity: 4,
          useNativeDriver: false
        })
      )
    }

    if (animate) {
      Animated.parallel(animations).start()
    } else {
      position.setValue(newValue)
      bgColor.setValue(newValue)
    }
  }

  getValueInPercentage = (value: number, maxValue: number) => {
    const minValue = this.props.minValue ?? 0

    return Math.ceil(((value - minValue) / (maxValue - minValue)) * 100)
  }

  shouldComponentUpdate(nextProps: TProgressBarProps, nextState: TProgressBarState) {
    // Don't re-render unless max value changes since we're using Animated
    // to manage the value change and that will work without re-rendering.
    const conditions = [
      this.state.width !== nextState.width,
      this.props.value !== nextProps.value &&
        (nextProps.screenReaderEnabled || nextProps.showValues),
      this.props.maxValue !== nextProps.maxValue,
      this.state.showValues !== nextState.showValues,
      this.props.showValues !== nextProps.showValues
    ]

    if (conditions.some(Boolean)) {
      return true
    } else {
      return false
    }
  }

  barColor = () => {
    const { bgColor } = this.state
    const { color } = this.props

    if (typeof color === 'object' && color.length === 2) {
      return bgColor.interpolate({
        inputRange: [0, 100],
        outputRange: [color[0], color[1]]
      })
    } else if (typeof color === 'string') {
      return color || style.progress.backgroundColor
    }
  }

  handleLayoutChange = ({ nativeEvent }: LayoutChangeEvent) => {
    const { width } = nativeEvent.layout

    if (width !== this.state.width) {
      this.setState(
        {
          width
        },
        () => {
          this.changeValue(this.props.value, this.props.maxValue, false)
        }
      )
    }
  }

  onPressIn = () => {
    const { showValuesOnPress = false } = this.props

    if (showValuesOnPress) {
      this.setState({ showValues: true })
    }
  }

  onPressOut = () => {
    this.setState({ showValues: false })
  }

  render() {
    const { position, width } = this.state
    const {
      borderRadius = 10,
      height = 10,
      value,
      color,
      maxValue,
      accessibilityLabel,
      showValuesOnPress = false,
      valueStyles,
      valuesLabel
    } = this.props

    return (
      <View
        accessible
        accessibilityLabel={
          accessibilityLabel
            ? `${accessibilityLabel} ${t('VALUE-X_OF_Y-LABEL', {
                value,
                total: maxValue
              })}`
            : t('VALUE-X_OF_Y-LABEL', {
                value,
                total: maxValue
              })
        }
        style={{ ...style.wrapper, height, borderRadius }}
        onLayout={this.handleLayoutChange}
      >
        <View style={[style.barsWrapper, { height, borderRadius }]}>
          <Animated.View
            style={[
              {
                ...style.progress,
                borderRadius
              },
              {
                transform: [
                  {
                    translateX: position.interpolate({
                      inputRange: [0, 100],
                      outputRange: [-width, 0]
                    })
                  }
                ]
              }
            ]}
          >
            {typeof color === 'string' ? (
              <View
                style={{
                  flex: 1,
                  height,
                  backgroundColor: color
                }}
              />
            ) : (
              <Animated.View
                style={{
                  flex: 1,
                  height,
                  backgroundColor: this.barColor()
                }}
              />
            )}
          </Animated.View>
        </View>

        {(this.props.showValues || showValuesOnPress) && (
          <Pressable
            disabled={!showValuesOnPress}
            onPressIn={this.onPressIn}
            onPressOut={this.onPressOut}
            style={style.valuesWrapper}
          >
            {(this.props.showValues || (showValuesOnPress && this.state.showValues)) && (
              <Text
                style={[
                  style.values,
                  {
                    fontSize: height * 0.9,
                    lineHeight:
                      valueStyles && 'fontSize' in valueStyles && valueStyles.fontSize
                        ? valueStyles.fontSize * 0.9
                        : height * 0.9
                  },
                  valueStyles
                ]}
              >
                {valuesLabel && `${valuesLabel} `}
                {value} / {maxValue}
              </Text>
            )}
          </Pressable>
        )}
      </View>
    )
  }
}
