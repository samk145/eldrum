import type { EditorTest } from '@actnone/eldrum-editor/dist/types'
import type { Game } from '../../game'
import type { SaveDataTest } from '../../database/schemas/save/save-data'
import ContentTestTask from './content-test-task'

export interface ContentTest extends Omit<EditorTest, 'tasks'> {
  tasks: ContentTestTask[]
}

const PREFERRED_PATH_TYPE = 'preferredPath' as const
const PREFERRED_OPTION_TYPE = 'preferredOption' as const

export class ContentTest {
  constructor(
    private readonly game: Game,
    defaultProps: EditorTest,
    storedProps?: SaveDataTest
  ) {
    Object.assign(this, defaultProps)

    if (storedProps) {
      Object.assign(this, storedProps)
    }

    this.tasks = defaultProps.tasks.map(taskId => {
      const storedTask = storedProps?.tasks.find(storedStep => storedStep._id === taskId)
      return new ContentTestTask(this.game, game.getEntity('testTasks', taskId), storedTask)
    })
  }

  get currentTask() {
    return this.tasks.find(task => task.active)
  }

  get optionIdsToIgnore(): string[] {
    const { currentTask } = this

    return currentTask
      ? currentTask.optionsToIgnore.map(sceneNodeOptionIdPath => sceneNodeOptionIdPath[2])
      : []
  }

  get currentTarget() {
    const { movement } = this.game
    const { currentTask } = this

    if (currentTask?.currentStep) {
      switch (currentTask.currentStep.type) {
        case 'getToLocation': {
          const routeToTarget = movement.getShortestRoute(
            movement.locationId,
            currentTask.currentStep.id,
            {
              anyRoute: true,
              mapOnly: false
            }
          )

          if (!routeToTarget.length) {
            return
          }

          return {
            type: PREFERRED_PATH_TYPE,
            id: routeToTarget[0]._id
          }
        }
        case 'usePath':
          return {
            type: PREFERRED_PATH_TYPE,
            id: currentTask.currentStep.id
          }
        case 'useOption':
          return {
            type: PREFERRED_OPTION_TYPE,
            id: currentTask.currentStep.id
          }
      }
    }
  }
}

export default ContentTest
