import type { DemoCharacterItem } from '../item'
import { Inventory, type IInventoryGenerics } from '@actnone/eldrum-engine/models'
import type { DemoGame } from '../game'

interface IDemoInventoryGenerics extends IInventoryGenerics {
  Game: DemoGame
  CharacterItem: DemoCharacterItem
}

export class DemoInventory extends Inventory<IDemoInventoryGenerics> {}
