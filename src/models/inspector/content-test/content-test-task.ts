import type { EditorTestTask } from '@actnone/eldrum-editor/dist/types'
import { computed, reaction, type IReactionDisposer } from 'mobx'
import type { Game } from '../../game'
import type { SaveDataTestTask } from '../../database/schemas/save/save-data'
import ContentTestTaskStep from './content-test-task-step'

export interface ContentTestTask
  extends Pick<EditorTestTask, '_id' | 'conditions' | 'name' | 'optionsToIgnore'> {
  steps: ContentTestTaskStep[]
}

export class ContentTestTask {
  constructor(
    private readonly game: Game,
    defaultProps: EditorTestTask,
    storedProps?: SaveDataTestTask
  ) {
    this.name = defaultProps.name
    this._id = defaultProps._id
    this.conditions = defaultProps.conditions
    this.optionsToIgnore = defaultProps.optionsToIgnore

    this.steps = defaultProps.steps.map(defaultStep => {
      const storedStep = storedProps?.steps.find(storedStep => storedStep._id === defaultStep._id)

      return new ContentTestTaskStep(game, defaultStep, storedStep)
    })

    this.addListeners()
  }

  onDeActivation?: IReactionDisposer
  onCompletion?: IReactionDisposer
  onCurrentStepChange?: IReactionDisposer

  @computed get active() {
    return this.game.passesConditions(this.conditions) && !this.completed
  }

  @computed get currentStep() {
    if (!this.active) {
      return
    }

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i]

      if (!step.completed) {
        return step
      }
    }
  }

  @computed get completedSteps() {
    return this.steps.filter(step => step.completed)
  }

  @computed get completed() {
    const { steps } = this

    return (
      steps.length > 0 &&
      (this.completedSteps.length === steps.length || steps[steps.length - 1].completed)
    )
  }

  activateCurrentStep = () => this.currentStep?.activate()

  deActivateSteps = () => this.steps.forEach(step => step.deActivate())

  addListeners = () => {
    this.onCurrentStepChange = reaction(
      () => this.currentStep,
      currentStep => currentStep && currentStep.activate(),
      { name: 'onTestTaskOnActivation', fireImmediately: true }
    )

    this.onDeActivation = reaction(
      () => this.active,
      active => !active && this.deActivateSteps(),
      { name: 'onTestTaskOnActivation', fireImmediately: true }
    )

    this.onCompletion = reaction(
      () => this.completed,
      completed => {
        if (completed) {
          this.game.notifications.create(`Completed Test Task ${this.name}`)
        }
      },
      { name: 'onTestTaskCompletion' }
    )
  }
}

export default ContentTestTask
