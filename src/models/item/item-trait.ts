import { Trait, type ITraitGenerics } from '../character'
import type Item from './item'

interface IItemTraitGenerics extends ITraitGenerics {
  Item: Item
}

export abstract class ItemTrait<
  G extends IItemTraitGenerics = IItemTraitGenerics
> extends Trait<G> {
  constructor(
    public readonly item: G['Item'],
    character: G['Possessor']
  ) {
    super(character)
  }
}
