import { useGameStore } from '../contexts/stores'

export const useToken = () => {
  const game = useGameStore()

  // Extracts the tokens from the string and the replaces it with its value.
  // Each token is expected to have the following form:
  // {<model>.<name>.<property>}
  // IDs are supported, such as {variables.674900f089f15972acaf0f12.value}
  function replace(value: string) {
    const variables = value.match(/\{([^{}]+)\}/g)

    if (!variables) return value

    let result = value

    variables.forEach(variable => {
      const path = variable.slice(1, -1)
      const segments = path.split('.')

      let replacementValue: string | undefined

      if (segments[0] === 'variables') {
        const variable = game.variables.getVariable(segments[1])

        if (variable && ['name', 'value'].includes(segments[2])) {
          const value = variable[segments[2] as 'name' | 'value']
          replacementValue = value !== null ? value.toString() : undefined
        }
      }

      result = replacementValue ? result.replace(variable, replacementValue) : result
    })

    return result
  }

  return {
    replace
  }
}
