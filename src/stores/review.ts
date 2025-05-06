import type Game from '../models/game'
import type { Database } from '../models/database'
import { Platform } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import * as Rate from 'react-native-store-review'
import { computed, type IReactionDisposer, reaction } from 'mobx'
import moment from 'moment'

import Review from '../models/database/schemas/review'
import { logger } from '../helpers/logger'
import { analytics } from '../helpers/analytics'
import type { Stores } from '.'

enum ReviewAnalyticsEvents {
  REPLIED = 'Replied to review request'
}

export class ReviewStore {
  constructor(
    private readonly stores: Pick<Stores, 'ui' | 'play' | 'settings'>,
    private readonly database: Database
  ) {}

  reaction?: IReactionDisposer
  inGameReaction?: IReactionDisposer
  reviewedAt?: number
  lastAsked?: number
  timesAsked: number = 0

  timeLimitHasPassed = (timestamp?: number) => {
    return timestamp ? moment(timestamp).diff(moment(), 'months') < -3 : false
  }

  @computed get canAskForReview() {
    const { config } = this.stores.settings

    if (
      (Platform.OS === 'ios' && !config.appStoreId) ||
      (Platform.OS === 'android' && !config.androidPackageName) ||
      this.reviewedAt ||
      (this.timesAsked >= 3 && !this.timeLimitHasPassed(this.lastAsked))
    ) {
      return false
    } else {
      return true
    }
  }

  askForReview = async () => {
    const { alert } = this.stores.ui
    const netState = await NetInfo.fetch()

    if (!netState.isConnected) {
      return
    }

    this.timesAsked++
    this.lastAsked = new Date().getTime()
    await this.dehydrate()

    alert(
      'Enjoying the game?',
      'Your review can help spread the word and grow the Eldrum community',
      [
        {
          text: this.timesAsked === 3 ? 'No thanks' : 'Later',
          onPress: () => {
            analytics.event(ReviewAnalyticsEvents.REPLIED, { accepted: false })
          }
        },
        {
          text: 'Rate now',
          onPress: this.triggerReviewRequest
        }
      ]
    )
  }

  triggerReviewRequest = () => {
    try {
      Rate.requestReview()
      this.onReviewSuccess()
      analytics.event(ReviewAnalyticsEvents.REPLIED, { accepted: true })
    } catch (error) {
      logger.error(new Error('An error occurred when requesting the user to review'))
    }
  }

  onReviewSuccess = () => {
    this.reviewedAt = new Date().getTime()
    this.dehydrate()
    this.disposeReaction()
    this.disposeInGameReaction()
  }

  disposeReaction = () => {
    if (this.reaction) {
      this.reaction()
    }
  }

  disposeInGameReaction = () => {
    if (this.inGameReaction) {
      this.inGameReaction()
    }
  }

  rehydrate = async () => {
    const reviews = await this.database.collection<Review>(Review.schema.name)
    const currentUserReviewData = reviews.find(item => item.user === 'main')

    this.reviewedAt = currentUserReviewData?.reviewedAt
    this.lastAsked = currentUserReviewData?.lastAsked
    this.timesAsked = currentUserReviewData?.timesAsked || this.timesAsked

    // Reset the ask limit if enough time has passed
    if (this.timeLimitHasPassed(this.lastAsked)) {
      this.timesAsked = 0
    }

    if (!this.reviewedAt) {
      this.createReactions()
    }
  }

  dehydrate = async () => {
    const reviewData = new Review({
      user: 'main',
      timesAsked: this.timesAsked,
      reviewedAt: this.reviewedAt,
      lastAsked: this.lastAsked
    })

    await this.database.createOrUpdate<Review>(Review.schema.name, reviewData)
  }

  createReactions = () => {
    this.reaction = reaction(
      () => this.stores.play.gameWasJustCompleted,
      gameWasJustCompleted => {
        if (gameWasJustCompleted && this.canAskForReview) {
          this.askForReview()
        }
      },
      { name: 'gameWasJustCompletedReaction' }
    )
  }

  createInGameReactions = (game: Game) => {
    this.inGameReaction = reaction(
      () =>
        this.stores.settings.config.reviewAskOptionIds.includes(
          game.statistics.getRecord('lastUsedOption')!
        ),
      hasUsedOption => {
        if (hasUsedOption && this.canAskForReview) {
          this.askForReview()
        }
      },
      { name: 'usedReviewOptionReaction' }
    )
  }

  createInGameReactionsReaction = reaction(
    () => this.stores.play.game,
    game => {
      if (game && !this.reviewedAt) {
        this.createInGameReactions(game)
      } else {
        this.disposeInGameReaction()
      }
    },
    { name: 'createInGameReactionsReaction' }
  )
}

export default ReviewStore
