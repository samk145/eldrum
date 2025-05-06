import type { ObjectSchema } from 'realm'
import type { ISchemaClass, SchemaProperties } from '..'
import type AchievementsStore from '../../../stores/achievements'

export type AchievementsProperties = Omit<
  Achievements,
  'schema' | 'schemaProperties' | 'parseJsonProperties'
>

interface Achievements
  extends ISchemaClass,
    Pick<
      AchievementsStore['values'],
      | 'user'
      | 'hasCompletedGame'
      | 'seenEndings'
      | 'achievementsWithUpdate'
      | 'achievementsCompleted'
      | 'achievementsDiscovered'
      | 'tasksDiscovered'
      | 'tasksCompleted'
    > {}

/* eslint-disable @typescript-eslint/no-extraneous-class */
class Achievements {
  constructor({
    user = 'main',
    seenEndings = {},
    hasCompletedGame = false,
    achievementsWithUpdate = {},
    achievementsCompleted = {},
    achievementsDiscovered = {},
    tasksDiscovered = {},
    tasksCompleted = {}
  }: AchievementsProperties) {
    this.user = user
    this.seenEndings = seenEndings
    this.hasCompletedGame = hasCompletedGame
    this.achievementsWithUpdate = achievementsWithUpdate
    this.achievementsCompleted = achievementsCompleted
    this.achievementsDiscovered = achievementsDiscovered
    this.tasksDiscovered = tasksDiscovered
    this.tasksCompleted = tasksCompleted
  }

  static schemaProperties: SchemaProperties<Achievements> = {
    user: 'string',
    seenEndings: 'bool{}',
    hasCompletedGame: 'bool',
    achievementsWithUpdate: 'bool{}',
    achievementsCompleted: 'bool{}',
    achievementsDiscovered: 'bool{}',
    tasksDiscovered: 'bool{}',
    tasksCompleted: 'bool{}'
  }

  static schema: ObjectSchema = {
    name: 'Achievements',
    primaryKey: 'user',
    properties: Achievements.schemaProperties
  }
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default Achievements
