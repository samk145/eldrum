import type { EditorItem } from '@actnone/eldrum-editor/dist/types'
import type Game from './game'
import type TItem from './item/t-item'
import type BargainItem from './item/bargain-item'
import type { Npc } from './character/npc'

import { action } from 'mobx'
import { t } from '../i18n'

export class Bargain<TBargainItem extends BargainItem = BargainItem> {
  constructor(
    private readonly game: Game,
    private readonly createItem: (item: EditorItem) => TBargainItem,
    private readonly onEnd: () => void,
    npcId: string
  ) {
    const npc = game.actors.getNpc(npcId)

    this.npc = npc

    if (npc.bargain?.length) {
      const bargainTable = npc.bargain.find(bargainTable => {
        return this.game.passesConditions(bargainTable.conditions)
      })

      this.inventory = bargainTable
        ? bargainTable.items.map(bargainTableItem =>
            this.createItem(this.game.getEntity('items', bargainTableItem.item))
          )
        : []
    }
  }

  npc: Npc
  inventory: TBargainItem[] = []

  /**
   * Buy item
   *
   * @param {object} item
   */
  @action buyItem = (item: BargainItem) => {
    const { character } = this.game
    const price = this.calculateBuyPrice(item)

    character.changeGold(-price)
    character.inventory.pickUpItem(item._id)
  }

  /**
   * Sell item
   *
   * @param {object} item
   */
  @action sellItem = (item: TItem) => {
    const { character } = this.game
    const sellValue = this.calculateSellValue(item)

    character.changeGold(sellValue, false)
    character.inventory.removeItemById(item._id, { notify: false })

    this.game.notifications.create(
      t(
        sellValue === 1 ? 'BARGAIN-SELL-NOTIFICATION' : 'BARGAIN-SELL-NOTIFICATION-PLURAL_CURRENCY',
        { itemName: item.name, sellValue }
      )
    )
  }

  /**
   * Calculate item price
   *
   * @param {object} item
   */
  calculateBuyPrice = (item: BargainItem) => {
    const npcCharisma = this.npc.charisma || 1

    let modifier = npcCharisma / this.game.character.charisma

    // Limit the modifier as a way to construct a very simple
    // diminishing return
    if (modifier > 1.75) {
      modifier = 1.75
    } else if (modifier < 0.75) {
      modifier = 0.75
    }

    return Math.ceil(modifier * item.value) || 1
  }

  /**
   * Calculate sell value
   *
   * @param {object} item
   */
  calculateSellValue = (item: TItem) => {
    const npcCharisma = this.npc.charisma || 1

    let modifier = this.game.character.charisma / npcCharisma

    // Limit the modifier as a way to construct a very simple
    // diminishing return
    if (modifier > 1.75) {
      modifier = 1.75
    } else if (modifier < 0.75) {
      modifier = 0.75
    }

    return Math.floor((modifier * item.value) / 3) || 1
  }

  /**
   * End bargain
   */
  @action endBargain() {
    this.onEnd()
    this.inventory = []
  }
}

export default Bargain
