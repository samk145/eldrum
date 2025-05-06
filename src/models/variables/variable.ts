import type { EditorVariable } from '@actnone/eldrum-editor/dist/types'
import type SaveDataVariable from '../database/schemas/save/save-data/save-data-variable'
import { observable, action } from 'mobx'

type TVariableValue = string | number | boolean | null

class Variable {
  constructor(defaultProps: EditorVariable, storedProps?: SaveDataVariable) {
    this.name = defaultProps.name
    this._id = storedProps?._id || defaultProps._id
    this.type = storedProps?.type || defaultProps.type
    this.value = storedProps?.value ?? defaultProps.value
  }

  _id: string
  name: string
  type: EditorVariable['type']
  isReputation?: boolean
  @observable value: TVariableValue = null

  @action setValue = (value: TVariableValue) => {
    switch (this.type) {
      case 'boolean':
        this.value = Boolean(value)
        break
      case 'number':
        this.value = Number(value)
        break
      default:
        this.value = value
    }
  }
}

export default Variable
