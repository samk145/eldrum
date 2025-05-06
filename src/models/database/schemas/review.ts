import type { ObjectSchema } from 'realm'
import type { ISchemaClass, SchemaProperties } from '..'

interface Review extends ISchemaClass {}

/* eslint-disable @typescript-eslint/no-extraneous-class */
class Review {
  constructor({
    user,
    reviewedAt,
    lastAsked,
    timesAsked
  }: Omit<Review, 'schema' | 'schemaProperties' | 'parseJsonProperties'>) {
    this.user = user || 'main'
    this.timesAsked = timesAsked || 0
    this.reviewedAt = reviewedAt
    this.lastAsked = lastAsked
  }

  static schemaProperties: SchemaProperties<Review> = {
    user: 'string',
    timesAsked: 'int',
    lastAsked: 'int?',
    reviewedAt: 'int?'
  }

  static schema: ObjectSchema = {
    name: 'Review',
    primaryKey: 'user',
    properties: Review.schemaProperties
  }

  user: string
  timesAsked: number
  reviewedAt?: number
  lastAsked?: number
}
/* eslint-enable @typescript-eslint/no-extraneous-class */

export default Review
