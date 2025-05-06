import type { EditorNode } from '@actnone/eldrum-editor/dist/types'
import type Game from '../game'
import { computed } from 'mobx'
import Option from './option'

interface Node extends Omit<EditorNode, '_position' | 'options'> {
  options: Option[]
}

class Node {
  constructor(game: Game, node: EditorNode) {
    this._id = node._id
    this.audio = node.audio
    this.autoSave = node.autoSave
    this.background = node.background
    this.cutScene = node.cutScene
    this.narrative = node.narrative
    this.options = node.options.map(option => new Option(game, option))
  }

  @computed get availableOptions() {
    return this.options.filter(option => option.isAvailable)
  }
}

export default Node
