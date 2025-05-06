import type { EditorTestTaskStep } from '@actnone/eldrum-editor/dist/types'
import type { SaveDataTestTaskStep } from '../../database/schemas/save/save-data'
import type { Game } from '../../game'
import { observable, action, reaction, type IReactionDisposer } from 'mobx'

type TContentTestTaskStepType = 'usePath' | 'getToLocation' | 'useOption'

export interface ContentTestTaskStep extends EditorTestTaskStep {}

export class ContentTestTaskStep {
  constructor(
    private readonly game: Game,
    defaultProps: EditorTestTaskStep,
    storedProps?: SaveDataTestTaskStep
  ) {
    this._id = defaultProps._id
    this.editorId = defaultProps.id
    this.type = defaultProps.type

    if (storedProps) {
      Object.assign(this, storedProps)
    }
  }

  private readonly editorId: EditorTestTaskStep['id']
  private onLocationChange?: IReactionDisposer
  private onPathUsage?: IReactionDisposer
  private onOptionUsage?: IReactionDisposer
  private onBarterStart?: IReactionDisposer

  @observable completed: boolean = false

  activate = () => {
    this.addListeners()
  }

  deActivate = () => {
    this.removeListeners()
  }

  @action markAsComplete = () => {
    this.removeListeners()
    this.completed = true
  }

  @action markAsIncomplete = () => {
    this.addListeners()
    this.completed = false
  }

  get id(): string {
    switch (this.type) {
      case 'usePath':
      case 'getToLocation':
      case 'purchaseItem':
        return this.editorId as string
      case 'useOption':
        return this.editorId[2]
    }
  }

  private readonly addListeners = () => {
    switch (this.type) {
      case 'usePath':
        this.onPathUsage = reaction(
          () => this.game.movement.currentPathId,
          pathId => {
            if (this.type === 'usePath') {
              if (pathId === this.id) {
                this.markAsComplete()
              }
            }
          },
          { name: 'TestTaskStepOnPathUsage', fireImmediately: true }
        )
        break
      case 'getToLocation':
        this.onLocationChange = reaction(
          () => this.game.movement.location,
          location => {
            if (this.type === 'getToLocation') {
              if (location._id === this.id) {
                this.markAsComplete()
              }
            }
          },
          { name: 'TestTaskStepOnLocationChange', fireImmediately: true }
        )
        break
      case 'purchaseItem':
        this.onBarterStart = reaction(
          () => this.game.bargain,
          bargain => {
            if (bargain) {
              const item = bargain.inventory.find(item => item._id === this.id)

              if (item) {
                bargain.buyItem(item)
                bargain.endBargain()
                this.markAsComplete()
              } else {
                bargain.endBargain()
              }
            }
          },
          { name: 'TestTaskStepOnBarterStart', fireImmediately: true }
        )
        break
      case 'useOption':
        this.onOptionUsage = reaction(
          () => this.game.statistics.getRecord('usedOptions', this.id),
          numberOfTimesUsed => {
            if (numberOfTimesUsed) {
              this.markAsComplete()
            }
          },
          { name: 'TestTaskStepOnOptionUsage' }
        )
        break
    }
  }

  private readonly removeListeners = () => {
    if (this.onLocationChange) {
      this.onLocationChange()
    }

    if (this.onPathUsage) {
      this.onPathUsage()
    }

    if (this.onOptionUsage) {
      this.onOptionUsage()
    }

    if (this.onBarterStart) {
      this.onBarterStart()
    }
  }
}

export type { TContentTestTaskStepType }
export default ContentTestTaskStep
