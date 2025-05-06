import { type IPassiveGenerics, Passive } from '../passive'
import { type StatModifier } from '../stat-modifier'

export interface ITraitGenerics extends IPassiveGenerics {}

export abstract class Trait<G extends ITraitGenerics = ITraitGenerics> extends Passive<G> {
  get statModifiers(): StatModifier[] {
    return []
  }

  visible: boolean = false
  modifiesEffects?: Set<G['Effect']['id']>
  modifiesCombatActions?: Set<G['Effect']['id']>
}
