import type { DemoGame } from '../game'
import { Character, type ICharacterGenerics } from '@actnone/eldrum-engine/models'
import { DemoCharacterItem } from '../item'
import { DemoCharacterAttack, DemoCharacterAttacks } from './attacks'
import { factory as effectFactory } from './effects'
import { DemoCharacterEffects } from './character-effects'
import { DemoInventory } from './inventory'
import { DemoMaxEncumbrance, DemoCharacterMaxHealth } from './derivatives'

interface IDemoCharacterGenerics extends ICharacterGenerics {
  Game: DemoGame
  Inventory: DemoInventory
}

export class DemoCharacter extends Character<IDemoCharacterGenerics> {
  constructor(game: DemoGame) {
    super(game)
    this.stats.maxHealth = new DemoCharacterMaxHealth(this)
    this.stats.maxEncumbrance = new DemoMaxEncumbrance(this)

    this.postConstructor()
  }

  effects: DemoCharacterEffects = new DemoCharacterEffects(this.game, this, effectFactory)

  postConstructor() {
    this.inventory.restoreItems(this, this.game._default.character.inventory)
    super.postConstructor()
  }

  inventory: DemoInventory = new DemoInventory(
    this.game,
    ({ character, defaultProps, storedProps }) =>
      new DemoCharacterItem(character, defaultProps, storedProps)
  )

  attacks: DemoCharacterAttacks = new DemoCharacterAttacks(
    this,
    (actor, attack, item) => new DemoCharacterAttack(actor.inventory, actor.attacks, attack, item)
  )
}
