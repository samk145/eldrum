import type { EditorOption } from '@actnone/eldrum-editor/dist/types'
import type Game from '../game'

import { computed } from 'mobx'
import { t } from '../../i18n'
import { shortenObjectId } from '../../helpers/misc'

interface Option
  extends Pick<
    EditorOption,
    '_id' | 'availability' | 'actions' | 'label' | 'maxAccounts' | 'outcomes' | 'parent'
  > {}

class Option {
  constructor(
    private readonly game: Game,
    option: EditorOption
  ) {
    this._id = option._id
    this.availability = option.availability
    this.maxAccounts = option.maxAccounts
    this.parent = option.parent
    this.label = option.label
    this.outcomes = option.outcomes
    this.actions = option.actions
  }

  @computed get isAvailable() {
    const hasBeenUsedMoreThanMaxAccounts = this.maxAccounts && this.usageCount >= this.maxAccounts

    if (
      hasBeenUsedMoreThanMaxAccounts ||
      (this.parent && !this.game.statistics.hasUsedOption(this.parent)) ||
      !this.game.passesConditions(this.availability)
    ) {
      return false
    }

    return true
  }

  @computed get usageCount() {
    return this.game.statistics.getRecord('usedOptions', this._id)
  }

  @computed get currentLabel() {
    const { game } = this
    const labelIndex = game.getUsageValueIndex('option', this)

    if (!game.scene.scene._id || !game.scene.node._id) {
      throw new Error('Cannot determine option label. Game scene or node not set')
    }

    const key = `${shortenObjectId(game.scene.scene._id)}-NODE-${shortenObjectId(game.scene.node._id)}-OPT-${shortenObjectId(this._id)}-LABEL-${labelIndex}`

    return t(key, { ns: 'scenes' })
  }
}

export default Option
