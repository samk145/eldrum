import type Game from '../game'
import { observable, action } from 'mobx'
import Variable from './variable'

export class Variables {
  constructor(game: Game) {
    const variables = game.getEntities('variables')
    const savedVariables = game._default.variables.list || []

    this.list = variables.map(defaultVariable => {
      const storedVariable = savedVariables.find(v => v._id === defaultVariable._id)

      return new Variable(defaultVariable, storedVariable)
    })
  }

  @observable list: Variable[] = []

  /**
   * Set variable value
   *
   * @param {string} id - The id of the variable
   * @param {string|number|boolean} value - The new value
   */
  @action setValue = (id: string, value: string | number | boolean) => {
    const variable = this.getVariable(id)

    if (variable) {
      variable.setValue(value)
    }
  }

  /**
   * Increase / decrease numeric variable value
   *
   * @param {string} id - The id of the variable
   * @param {number} change - The increase/decrease
   */
  @action changeNumericVariable = (id: string, change: number) => {
    if (typeof change === 'string') {
      change = parseInt(change)
    }

    const variable = this.getVariable(id)

    if (variable && typeof variable.value === 'number') {
      variable.setValue(variable.value + change)
    }
  }

  /**
   * Get variable
   *
   * @param {string} id - The id of the variable
   */
  getVariable = (id: string) => {
    const variable = this.list.find(variable => variable._id === id)

    if (!variable) {
      throw new Error('Cannot find variable: ' + id)
    }

    return variable
  }
}

export default Variables
