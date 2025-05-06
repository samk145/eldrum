import { observable } from 'mobx'
import { Animated } from 'react-native'

export type TState = {
  opacity: Animated.Value
  translateX: Animated.Value
  translateY: Animated.Value
  scale: Animated.Value
}

export type TStateProperty = keyof TState

export class Marionette {
  constructor(public name: string) {
    this.state = {
      opacity: new Animated.Value(Marionette.defaultValues.opacity),
      translateX: new Animated.Value(Marionette.defaultValues.translateX),
      translateY: new Animated.Value(Marionette.defaultValues.translateY),
      scale: new Animated.Value(Marionette.defaultValues.scale)
    }
  }

  updateState(stateChanges: Anim[], isAccessible = true, callback: () => void) {
    const { state } = this
    const animations: Animated.CompositeAnimation[] = []

    stateChanges.forEach(animation => {
      if (animation.type === 'setValue') {
        state[animation.property].setValue(animation.options.toValue)
      } else {
        animations.push(
          Animated[animation.type](state[animation.property], {
            ...animation.options,
            useNativeDriver: true
          })
        )
      }
    })

    Animated.parallel(animations).start(() => {
      this.isAccessible = isAccessible
      callback()
    })
  }

  @observable state: TState
  @observable isAccessible: boolean = true

  static defaultValues = {
    translateX: 0,
    translateY: 0,
    scale: 1,
    opacity: 0
  }
}

type TAnimOptions =
  | Omit<Animated.TimingAnimationConfig, 'useNativeDriver' | 'toValue'>
  | Omit<Animated.SpringAnimationConfig, 'useNativeDriver' | 'toValue'>

export class Anim {
  constructor(
    public property: TStateProperty,
    toValue: number,
    public type: 'setValue' | 'timing' | 'spring',
    options?: TAnimOptions
  ) {
    this.options = options
      ? {
          ...options,
          toValue
        }
      : { toValue }
  }

  options: TAnimOptions & {
    toValue: number
  }
}
